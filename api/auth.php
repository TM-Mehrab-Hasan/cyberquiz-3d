<?php
/**
 * 3D Anti-Cheat Quiz System - Authentication API
 * 
 * Handles user authentication, session management, and security
 * Features: JWT tokens, rate limiting, device fingerprinting, 3D session tracking
 */

require_once 'database.php';

class AuthAPI {
    private $db;
    private $jwt_secret;
    private $session_timeout = 7200; // 2 hours
    
    public function __construct() {
        $this->db = new Database();
        $this->jwt_secret = $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-in-production';
        
        // Enable CORS for the frontend
        $this->db->enableCors();
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $segments = explode('/', trim($path, '/'));
        
        // Extract endpoint from URL
        $endpoint = end($segments);
        
        try {
            switch ($endpoint) {
                case 'login':
                    if ($method === 'POST') {
                        return $this->login();
                    }
                    break;
                    
                case 'register':
                    if ($method === 'POST') {
                        return $this->register();
                    }
                    break;
                    
                case 'logout':
                    if ($method === 'POST') {
                        return $this->logout();
                    }
                    break;
                    
                case 'verify':
                    if ($method === 'GET') {
                        return $this->verifyToken();
                    }
                    break;
                    
                case 'refresh':
                    if ($method === 'POST') {
                        return $this->refreshToken();
                    }
                    break;
                    
                case 'profile':
                    if ($method === 'GET') {
                        return $this->getProfile();
                    } elseif ($method === 'PUT') {
                        return $this->updateProfile();
                    }
                    break;
                    
                case 'reset-password':
                    if ($method === 'POST') {
                        return $this->requestPasswordReset();
                    }
                    break;
                    
                case 'confirm-reset':
                    if ($method === 'POST') {
                        return $this->confirmPasswordReset();
                    }
                    break;
                    
                default:
                    return $this->db->jsonResponse(404, false, 'Endpoint not found');
            }
        } catch (Exception $e) {
            error_log("Auth API Error: " . $e->getMessage());
            return $this->db->jsonResponse(500, false, 'Internal server error');
        }
        
        return $this->db->jsonResponse(405, false, 'Method not allowed');
    }
    
    /**
     * User login with enhanced security
     */
    private function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['email']) || !isset($input['password'])) {
            return $this->db->jsonResponse(400, false, 'Email and password required');
        }
        
        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        $password = $input['password'];
        $device_info = $input['device_info'] ?? [];
        $vr_enabled = $input['vr_enabled'] ?? false;
        
        // Rate limiting
        if (!$this->db->checkRateLimit($email, 'login', 5, 300)) {
            $this->db->logAntiCheatViolation(null, null, 'rate_limit_exceeded', 'medium', [
                'action' => 'login_attempt',
                'email' => $email,
                'attempts' => 6
            ]);
            return $this->db->jsonResponse(429, false, 'Too many login attempts. Please try again later.');
        }
        
        // Get user from database
        $user = $this->db->getUserByEmail($email);
        
        if (!$user || !password_verify($password, $user['password'])) {
            $this->db->logActivity(null, 'failed_login_attempt', [
                'email' => $email,
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
            ]);
            return $this->db->jsonResponse(401, false, 'Invalid credentials');
        }
        
        if (!$user['active']) {
            return $this->db->jsonResponse(403, false, 'Account is deactivated');
        }
        
        // Generate JWT token
        $token_data = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + $this->session_timeout
        ];
        
        $jwt_token = $this->generateJWT($token_data);
        
        // Create session record
        $session_token = bin2hex(random_bytes(32));
        $session_id = $this->createSession($user['id'], $session_token, $device_info, $vr_enabled);
        
        // Update last login
        $this->updateLastLogin($user['id']);
        
        // Log successful login
        $this->db->logActivity($user['id'], 'login', [
            'session_id' => $session_id,
            'vr_enabled' => $vr_enabled,
            'device_info' => $device_info
        ]);
        
        // Prepare user data for response
        $user_data = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'avatar_model' => $user['avatar_model'],
            'vr_enabled' => (bool)$user['vr_enabled'],
            'eye_tracking_calibrated' => (bool)$user['eye_tracking_calibrated'],
            'spatial_preferences' => json_decode($user['spatial_preferences'], true),
            'last_login' => $user['last_login']
        ];
        
        return $this->db->jsonResponse(200, true, 'Login successful', [
            'user' => $user_data,
            'token' => $jwt_token,
            'session_token' => $session_token,
            'expires_in' => $this->session_timeout
        ]);
    }
    
    /**
     * User registration with validation
     */
    private function register() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required_fields = ['name', 'email', 'password', 'role'];
        foreach ($required_fields as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                return $this->db->jsonResponse(400, false, "Field '{$field}' is required");
            }
        }
        
        $name = trim($input['name']);
        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        $password = $input['password'];
        $role = $input['role'];
        $vr_enabled = $input['vr_enabled'] ?? false;
        
        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->db->jsonResponse(400, false, 'Invalid email format');
        }
        
        // Validate role
        if (!in_array($role, ['student', 'teacher'])) {
            return $this->db->jsonResponse(400, false, 'Invalid role. Only student and teacher roles are allowed');
        }
        
        // Validate password strength
        if (strlen($password) < 8) {
            return $this->db->jsonResponse(400, false, 'Password must be at least 8 characters long');
        }
        
        // Rate limiting for registration
        if (!$this->db->checkRateLimit($email, 'register', 3, 3600)) {
            return $this->db->jsonResponse(429, false, 'Too many registration attempts. Please try again later.');
        }
        
        // Check if user already exists
        if ($this->db->getUserByEmail($email)) {
            return $this->db->jsonResponse(409, false, 'User with this email already exists');
        }
        
        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        // Create user
        $user_data = [
            'name' => $name,
            'email' => $email,
            'password' => $hashed_password,
            'role' => $role,
            'vr_enabled' => $vr_enabled ? 1 : 0,
            'active' => 1
        ];
        
        $user_id = $this->createUser($user_data);
        
        if (!$user_id) {
            return $this->db->jsonResponse(500, false, 'Failed to create user account');
        }
        
        // Log registration
        $this->db->logActivity($user_id, 'registration', [
            'role' => $role,
            'vr_enabled' => $vr_enabled
        ]);
        
        return $this->db->jsonResponse(201, true, 'Account created successfully', [
            'user_id' => $user_id,
            'message' => 'You can now log in with your credentials'
        ]);
    }
    
    /**
     * User logout
     */
    private function logout() {
        $user = $this->validateToken();
        if (!$user) {
            return $this->db->jsonResponse(401, false, 'Invalid token');
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $session_token = $input['session_token'] ?? null;
        
        if ($session_token) {
            $this->endSession($session_token);
        }
        
        $this->db->logActivity($user['user_id'], 'logout');
        
        return $this->db->jsonResponse(200, true, 'Logged out successfully');
    }
    
    /**
     * Verify JWT token
     */
    private function verifyToken() {
        $user = $this->validateToken();
        if (!$user) {
            return $this->db->jsonResponse(401, false, 'Invalid or expired token');
        }
        
        $user_data = $this->db->getUserById($user['user_id']);
        if (!$user_data || !$user_data['active']) {
            return $this->db->jsonResponse(401, false, 'User account is inactive');
        }
        
        // Prepare safe user data
        $safe_user_data = [
            'id' => $user_data['id'],
            'name' => $user_data['name'],
            'email' => $user_data['email'],
            'role' => $user_data['role'],
            'avatar_model' => $user_data['avatar_model'],
            'vr_enabled' => (bool)$user_data['vr_enabled'],
            'eye_tracking_calibrated' => (bool)$user_data['eye_tracking_calibrated'],
            'spatial_preferences' => json_decode($user_data['spatial_preferences'], true)
        ];
        
        return $this->db->jsonResponse(200, true, 'Token is valid', [
            'user' => $safe_user_data
        ]);
    }
    
    /**
     * Refresh JWT token
     */
    private function refreshToken() {
        $user = $this->validateToken();
        if (!$user) {
            return $this->db->jsonResponse(401, false, 'Invalid token');
        }
        
        // Generate new token
        $token_data = [
            'user_id' => $user['user_id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + $this->session_timeout
        ];
        
        $new_token = $this->generateJWT($token_data);
        
        return $this->db->jsonResponse(200, true, 'Token refreshed', [
            'token' => $new_token,
            'expires_in' => $this->session_timeout
        ]);
    }
    
    /**
     * Get user profile
     */
    private function getProfile() {
        $user = $this->validateToken();
        if (!$user) {
            return $this->db->jsonResponse(401, false, 'Invalid token');
        }
        
        $user_data = $this->db->getUserById($user['user_id']);
        if (!$user_data) {
            return $this->db->jsonResponse(404, false, 'User not found');
        }
        
        // Get additional profile data
        $profile_data = [
            'id' => $user_data['id'],
            'name' => $user_data['name'],
            'email' => $user_data['email'],
            'role' => $user_data['role'],
            'avatar_model' => $user_data['avatar_model'],
            'vr_enabled' => (bool)$user_data['vr_enabled'],
            'eye_tracking_calibrated' => (bool)$user_data['eye_tracking_calibrated'],
            'spatial_preferences' => json_decode($user_data['spatial_preferences'], true),
            'gesture_profile' => json_decode($user_data['gesture_profile'], true),
            'created_at' => $user_data['created_at'],
            'last_login' => $user_data['last_login']
        ];
        
        return $this->db->jsonResponse(200, true, 'Profile retrieved', [
            'profile' => $profile_data
        ]);
    }
    
    /**
     * Update user profile
     */
    private function updateProfile() {
        $user = $this->validateToken();
        if (!$user) {
            return $this->db->jsonResponse(401, false, 'Invalid token');
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $updates = [];
        
        // Allowed fields for update
        $allowed_fields = ['name', 'avatar_model', 'vr_enabled', 'spatial_preferences', 'gesture_profile'];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field])) {
                if (in_array($field, ['spatial_preferences', 'gesture_profile'])) {
                    $updates[$field] = json_encode($input[$field]);
                } elseif ($field === 'vr_enabled') {
                    $updates[$field] = $input[$field] ? 1 : 0;
                } else {
                    $updates[$field] = $input[$field];
                }
            }
        }
        
        if (empty($updates)) {
            return $this->db->jsonResponse(400, false, 'No valid fields to update');
        }
        
        $success = $this->updateUser($user['user_id'], $updates);
        
        if ($success) {
            $this->db->logActivity($user['user_id'], 'profile_update', [
                'updated_fields' => array_keys($updates)
            ]);
            
            return $this->db->jsonResponse(200, true, 'Profile updated successfully');
        } else {
            return $this->db->jsonResponse(500, false, 'Failed to update profile');
        }
    }
    
    /**
     * Request password reset
     */
    private function requestPasswordReset() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['email'])) {
            return $this->db->jsonResponse(400, false, 'Email is required');
        }
        
        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        
        // Rate limiting
        if (!$this->db->checkRateLimit($email, 'password_reset', 3, 3600)) {
            return $this->db->jsonResponse(429, false, 'Too many password reset requests');
        }
        
        $user = $this->db->getUserByEmail($email);
        if (!$user) {
            // Don't reveal if email exists
            return $this->db->jsonResponse(200, true, 'If the email exists, a reset link has been sent');
        }
        
        // Generate reset token
        $token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', time() + 3600); // 1 hour
        
        $this->createPasswordReset($user['id'], $token, $expires_at);
        
        $this->db->logActivity($user['id'], 'password_reset_requested');
        
        // In production, send email here
        // For demo, return the token (remove in production)
        return $this->db->jsonResponse(200, true, 'Password reset requested', [
            'reset_token' => $token, // Remove in production
            'message' => 'Check your email for reset instructions'
        ]);
    }
    
    /**
     * Confirm password reset
     */
    private function confirmPasswordReset() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['token']) || !isset($input['password'])) {
            return $this->db->jsonResponse(400, false, 'Token and new password are required');
        }
        
        $token = $input['token'];
        $new_password = $input['password'];
        
        if (strlen($new_password) < 8) {
            return $this->db->jsonResponse(400, false, 'Password must be at least 8 characters long');
        }
        
        $reset_record = $this->getPasswordReset($token);
        if (!$reset_record || $reset_record['used'] || strtotime($reset_record['expires_at']) < time()) {
            return $this->db->jsonResponse(400, false, 'Invalid or expired reset token');
        }
        
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        
        // Update password
        $success = $this->updateUser($reset_record['user_id'], ['password' => $hashed_password]);
        
        if ($success) {
            // Mark reset token as used
            $this->markPasswordResetAsUsed($reset_record['id']);
            
            $this->db->logActivity($reset_record['user_id'], 'password_reset_completed');
            
            return $this->db->jsonResponse(200, true, 'Password reset successfully');
        } else {
            return $this->db->jsonResponse(500, false, 'Failed to reset password');
        }
    }
    
    /**
     * Validate JWT token from Authorization header
     */
    private function validateToken() {
        $headers = getallheaders();
        $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (strpos($auth_header, 'Bearer ') !== 0) {
            return false;
        }
        
        $token = substr($auth_header, 7);
        return $this->verifyJWT($token);
    }
    
    /**
     * Generate JWT token
     */
    private function generateJWT($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $header_encoded = $this->base64UrlEncode($header);
        $payload_encoded = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $header_encoded . '.' . $payload_encoded, $this->jwt_secret, true);
        $signature_encoded = $this->base64UrlEncode($signature);
        
        return $header_encoded . '.' . $payload_encoded . '.' . $signature_encoded;
    }
    
    /**
     * Verify JWT token
     */
    private function verifyJWT($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        $valid_signature = hash_hmac('sha256', $header . '.' . $payload, $this->jwt_secret, true);
        $valid_signature_encoded = $this->base64UrlEncode($valid_signature);
        
        if ($signature !== $valid_signature_encoded) {
            return false;
        }
        
        $payload_data = json_decode($this->base64UrlDecode($payload), true);
        
        if ($payload_data['exp'] < time()) {
            return false;
        }
        
        return $payload_data;
    }
    
    /**
     * Base64 URL encode
     */
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
    
    /**
     * Database helper methods
     */
    
    private function createUser($data) {
        $sql = "INSERT INTO users (name, email, password, role, vr_enabled, active, created_at) 
                VALUES (:name, :email, :password, :role, :vr_enabled, :active, NOW())";
        
        $stmt = $this->db->getConnection()->prepare($sql);
        
        if ($stmt->execute($data)) {
            return $this->db->getConnection()->lastInsertId();
        }
        
        return false;
    }
    
    private function updateUser($user_id, $updates) {
        $set_clauses = [];
        $params = ['user_id' => $user_id];
        
        foreach ($updates as $field => $value) {
            $set_clauses[] = "{$field} = :{$field}";
            $params[$field] = $value;
        }
        
        $sql = "UPDATE users SET " . implode(', ', $set_clauses) . ", updated_at = NOW() WHERE id = :user_id";
        
        $stmt = $this->db->getConnection()->prepare($sql);
        return $stmt->execute($params);
    }
    
    private function createSession($user_id, $session_token, $device_info, $vr_mode) {
        $sql = "INSERT INTO quiz_sessions (user_id, quiz_id, session_token, ip_address, user_agent, vr_mode, device_type, browser_info, started_at) 
                VALUES (:user_id, NULL, :session_token, :ip_address, :user_agent, :vr_mode, :device_type, :browser_info, NOW())";
        
        $params = [
            'user_id' => $user_id,
            'session_token' => $session_token,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'vr_mode' => $vr_mode ? 1 : 0,
            'device_type' => $device_info['type'] ?? 'unknown',
            'browser_info' => json_encode($device_info)
        ];
        
        $stmt = $this->db->getConnection()->prepare($sql);
        
        if ($stmt->execute($params)) {
            return $this->db->getConnection()->lastInsertId();
        }
        
        return false;
    }
    
    private function endSession($session_token) {
        $sql = "UPDATE quiz_sessions SET ended_at = NOW() WHERE session_token = :session_token";
        $stmt = $this->db->getConnection()->prepare($sql);
        return $stmt->execute(['session_token' => $session_token]);
    }
    
    private function updateLastLogin($user_id) {
        $sql = "UPDATE users SET last_login = NOW() WHERE id = :user_id";
        $stmt = $this->db->getConnection()->prepare($sql);
        return $stmt->execute(['user_id' => $user_id]);
    }
    
    private function createPasswordReset($user_id, $token, $expires_at) {
        $sql = "INSERT INTO password_resets (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)";
        $stmt = $this->db->getConnection()->prepare($sql);
        return $stmt->execute([
            'user_id' => $user_id,
            'token' => $token,
            'expires_at' => $expires_at
        ]);
    }
    
    private function getPasswordReset($token) {
        $sql = "SELECT * FROM password_resets WHERE token = :token";
        $stmt = $this->db->getConnection()->prepare($sql);
        $stmt->execute(['token' => $token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function markPasswordResetAsUsed($reset_id) {
        $sql = "UPDATE password_resets SET used = 1 WHERE id = :id";
        $stmt = $this->db->getConnection()->prepare($sql);
        return $stmt->execute(['id' => $reset_id]);
    }
}

// Handle the request
$auth = new AuthAPI();
echo $auth->handleRequest();
?>
