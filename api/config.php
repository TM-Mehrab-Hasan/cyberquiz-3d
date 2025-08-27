<?php
/**
 * API Configuration for 3D Anti-Cheat Quiz System
 */

// Database configuration for XAMPP
define('DB_HOST', 'localhost');
define('DB_NAME', '3d_quiz_system');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// JWT configuration
define('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production-2024');
define('JWT_EXPIRY', 7200); // 2 hours

// API configuration
define('API_VERSION', '1.0.0');
define('API_BASE_URL', 'http://localhost/api/');

// File upload configuration
define('UPLOAD_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_ALLOWED_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'glb', 'gltf', 'obj', 'fbx']);
define('UPLOAD_PATH', '../uploads/');

// 3D Environment configuration
define('DEFAULT_ENVIRONMENT', 'cyberpunk');
define('VR_SUPPORT_ENABLED', true);
define('EYE_TRACKING_ENABLED', true);
define('GESTURE_DETECTION_ENABLED', true);

// Anti-cheat configuration
define('MAX_WARNINGS_BEFORE_TERMINATION', 3);
define('VIOLATION_SEVERITY_LEVELS', ['low', 'medium', 'high', 'critical']);
define('AUTO_TERMINATE_ON_CRITICAL', true);

// Rate limiting configuration
define('LOGIN_RATE_LIMIT', 5); // attempts per time window
define('RATE_LIMIT_WINDOW', 300); // 5 minutes
define('API_RATE_LIMIT', 100); // requests per minute
define('REGISTRATION_RATE_LIMIT', 3); // per hour

// Session configuration
define('SESSION_TIMEOUT', 7200); // 2 hours
define('MAX_CONCURRENT_SESSIONS', 3);
define('CLEANUP_INTERVAL', 3600); // 1 hour

// Logging configuration
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR
define('LOG_FILE_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('LOG_RETENTION_DAYS', 30);

// Email configuration (for password resets)
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'your-email@gmail.com');
define('MAIL_PASSWORD', 'your-app-password');
define('MAIL_FROM_ADDRESS', 'noreply@3dquiz.com');
define('MAIL_FROM_NAME', '3D Quiz System');

// Security configuration
define('ENABLE_CORS', true);
define('ALLOWED_ORIGINS', ['http://localhost:3000', 'http://127.0.0.1:3000']);
define('ENABLE_HTTPS_ONLY', false); // Set to true in production
define('ENABLE_CSRF_PROTECTION', true);

// Feature flags
define('ENABLE_DEMO_MODE', true);
define('ENABLE_DEBUG_MODE', true); // Set to false in production
define('ENABLE_ANALYTICS', true);
define('ENABLE_REAL_TIME_MONITORING', true);

// Performance configuration
define('DATABASE_POOL_SIZE', 10);
define('CACHE_ENABLED', true);
define('CACHE_TTL', 3600);

// Error reporting (disable in production)
if (ENABLE_DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
} else {
    // @phpstan-ignore-next-line - Production mode error suppression
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set timezone
date_default_timezone_set('UTC');

// CORS helper function
function enableCORS() {
    if (ENABLE_CORS) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, ALLOWED_ORIGINS) || ENABLE_DEBUG_MODE) {
            header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
        }
        
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
    }
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Security headers
function setSecurityHeaders() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    if (ENABLE_HTTPS_ONLY) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    }
}

// Initialize API environment
function initializeAPI() {
    enableCORS();
    setSecurityHeaders();
    
    // Set JSON response header
    header('Content-Type: application/json; charset=UTF-8');
    
    // Start session for CSRF protection
    if (ENABLE_CSRF_PROTECTION && session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

// Environment check
function checkEnvironment() {
    $required_extensions = ['pdo', 'pdo_mysql', 'json', 'openssl', 'curl'];
    $missing_extensions = [];
    
    foreach ($required_extensions as $ext) {
        if (!extension_loaded($ext)) {
            $missing_extensions[] = $ext;
        }
    }
    
    if (!empty($missing_extensions)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Missing required PHP extensions',
            'missing_extensions' => $missing_extensions
        ]);
        exit();
    }
    
    // Check upload directory
    if (!is_dir(UPLOAD_PATH)) {
        mkdir(UPLOAD_PATH, 0755, true);
    }
    
    // Check log directory
    $log_dir = dirname(__DIR__ . '/logs/api.log');
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
}

// Utility functions
function generateApiKey($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePassword($password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/', $password);
}

function logError($message, $context = []) {
    $log_entry = [
        'timestamp' => date('c'),
        'level' => 'ERROR',
        'message' => $message,
        'context' => $context,
        'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    error_log(json_encode($log_entry), 3, __DIR__ . '/../logs/api_errors.log');
}

// Initialize the API environment
checkEnvironment();
initializeAPI();

?>
