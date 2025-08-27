<?php
/**
 * Database Configuration and Connection Handler for 3D Anti-Cheat Quiz System
 * Handles MySQL database connections with enhanced security and logging
 */

class Database {
    private $host = 'localhost';
    private $username = 'root';
    private $password = '';
    private $database = '3d_quiz_system';
    private $connection;
    private $logFile = '../logs/database.log';
    
    public function __construct() {
        $this->connect();
        $this->createLogDirectory();
    }
    
    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
                PDO::ATTR_PERSISTENT => true
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            $this->log('Database connected successfully');
            
        } catch (PDOException $e) {
            $this->log('Database connection failed: ' . $e->getMessage(), 'ERROR');
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }
    
    public function getConnection() {
        // Check if connection is still alive
        if (!$this->connection) {
            $this->connect();
        }
        
        try {
            $this->connection->query('SELECT 1');
        } catch (PDOException $e) {
            $this->log('Connection lost, reconnecting...', 'WARNING');
            $this->connect();
        }
        
        return $this->connection;
    }
    
    // Enhanced query execution with logging and error handling
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            
            $this->log("Query executed: " . $this->sanitizeLogQuery($sql, $params));
            
            return $stmt;
            
        } catch (PDOException $e) {
            $this->log("Query failed: " . $e->getMessage() . " | SQL: " . $this->sanitizeLogQuery($sql, $params), 'ERROR');
            throw new Exception('Database query failed: ' . $e->getMessage());
        }
    }
    
    // Get single record
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    // Get multiple records
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    // Insert record and return ID
    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        
        $this->query($sql, $data);
        
        $insertId = $this->connection->lastInsertId();
        $this->log("Record inserted into {$table} with ID: {$insertId}");
        
        return $insertId;
    }
    
    // Update record
    public function update($table, $data, $condition, $conditionParams = []) {
        $setParts = [];
        foreach (array_keys($data) as $key) {
            $setParts[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $setParts);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$condition}";
        
        $params = array_merge($data, $conditionParams);
        $stmt = $this->query($sql, $params);
        
        $affectedRows = $stmt->rowCount();
        $this->log("Updated {$affectedRows} records in {$table}");
        
        return $affectedRows;
    }
    
    // Delete record
    public function delete($table, $condition, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$condition}";
        
        $stmt = $this->query($sql, $params);
        $affectedRows = $stmt->rowCount();
        
        $this->log("Deleted {$affectedRows} records from {$table}");
        
        return $affectedRows;
    }
    
    // Begin transaction
    public function beginTransaction() {
        $this->connection->beginTransaction();
        $this->log('Transaction started');
    }
    
    // Commit transaction
    public function commit() {
        $this->connection->commit();
        $this->log('Transaction committed');
    }
    
    // Rollback transaction
    public function rollback() {
        $this->connection->rollback();
        $this->log('Transaction rolled back');
    }
    
    // Escape and sanitize input
    public function escape($string) {
        return htmlspecialchars(strip_tags(trim($string)), ENT_QUOTES, 'UTF-8');
    }
    
    // Validate and sanitize email
    public function validateEmail($email) {
        $email = $this->escape($email);
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : false;
    }
    
    // Generate secure hash
    public function generateHash($password) {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);
    }
    
    // Verify password hash
    public function verifyHash($password, $hash) {
        return password_verify($password, $hash);
    }
    
    // Generate secure token
    public function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    // Security: Check for SQL injection patterns
    public function detectSQLInjection($input) {
        $patterns = [
            '/(\bUNION\b.*\bSELECT\b)/i',
            '/(\bSELECT\b.*\bFROM\b)/i',
            '/(\bINSERT\b.*\bINTO\b)/i',
            '/(\bUPDATE\b.*\bSET\b)/i',
            '/(\bDELETE\b.*\bFROM\b)/i',
            '/(\bDROP\b.*\bTABLE\b)/i',
            '/(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/i',
            '/(\'|\"|;|--|\||`)/i'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $input)) {
                $this->log("SQL injection attempt detected: " . $this->escape($input), 'SECURITY');
                return true;
            }
        }
        
        return false;
    }
    
    // Anti-cheat violation logging
    public function logAntiCheatViolation($userId, $quizId, $violationType, $severity = 'medium', $details = []) {
        $data = [
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'violation_type' => $violationType,
            'severity' => $severity,
            'details' => json_encode($details),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        try {
            $this->insert('anti_cheat_violations', $data);
            $this->log("Anti-cheat violation logged: {$violationType} for user {$userId}", 'SECURITY');
        } catch (Exception $e) {
            $this->log("Failed to log anti-cheat violation: " . $e->getMessage(), 'ERROR');
        }
    }
    
    // Activity logging
    public function logActivity($userId, $action, $details = []) {
        $data = [
            'user_id' => $userId,
            'action' => $action,
            'details' => json_encode($details),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        try {
            $this->insert('activity_logs', $data);
            $this->log("Activity logged: {$action} for user {$userId}");
        } catch (Exception $e) {
            $this->log("Failed to log activity: " . $e->getMessage(), 'ERROR');
        }
    }
    
    // Quiz session management
    public function createQuizSession($userId, $quizId) {
        $sessionData = [
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'session_token' => $this->generateToken(),
            'started_at' => date('Y-m-d H:i:s'),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ];
        
        $sessionId = $this->insert('quiz_sessions', $sessionData);
        
        $this->log("Quiz session created: {$sessionId} for user {$userId}, quiz {$quizId}");
        
        return [
            'session_id' => $sessionId,
            'session_token' => $sessionData['session_token']
        ];
    }
    
    // Validate quiz session
    public function validateQuizSession($sessionId, $sessionToken, $userId) {
        $sql = "SELECT * FROM quiz_sessions WHERE id = :session_id AND session_token = :token AND user_id = :user_id AND ended_at IS NULL";
        
        $session = $this->fetchOne($sql, [
            'session_id' => $sessionId,
            'token' => $sessionToken,
            'user_id' => $userId
        ]);
        
        if (!$session) {
            $this->log("Invalid quiz session: {$sessionId} for user {$userId}", 'SECURITY');
            return false;
        }
        
        // Check session timeout (2 hours max)
        $startTime = strtotime($session['started_at']);
        $currentTime = time();
        $maxDuration = 2 * 60 * 60; // 2 hours
        
        if (($currentTime - $startTime) > $maxDuration) {
            $this->endQuizSession($sessionId);
            $this->log("Quiz session expired: {$sessionId}", 'WARNING');
            return false;
        }
        
        return $session;
    }
    
    // End quiz session
    public function endQuizSession($sessionId) {
        $this->update('quiz_sessions', ['ended_at' => date('Y-m-d H:i:s')], 'id = :id', ['id' => $sessionId]);
        $this->log("Quiz session ended: {$sessionId}");
    }
    
    // Rate limiting
    public function checkRateLimit($identifier, $action, $maxAttempts = 10, $timeWindow = 300) {
        $sql = "SELECT COUNT(*) as attempts FROM rate_limits WHERE identifier = :identifier AND action = :action AND created_at > :time_window";
        
        $result = $this->fetchOne($sql, [
            'identifier' => $identifier,
            'action' => $action,
            'time_window' => date('Y-m-d H:i:s', time() - $timeWindow)
        ]);
        
        if ($result['attempts'] >= $maxAttempts) {
            $this->log("Rate limit exceeded for {$identifier}, action: {$action}", 'SECURITY');
            return false;
        }
        
        // Log this attempt
        $this->insert('rate_limits', [
            'identifier' => $identifier,
            'action' => $action,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        return true;
    }
    
    // Clean up old data
    public function cleanup() {
        try {
            // Clean old rate limit entries (older than 24 hours)
            $this->delete('rate_limits', 'created_at < :time', ['time' => date('Y-m-d H:i:s', time() - 86400)]);
            
            // Clean old expired sessions (older than 7 days)
            $this->delete('quiz_sessions', 'ended_at IS NOT NULL AND ended_at < :time', ['time' => date('Y-m-d H:i:s', time() - 604800)]);
            
            $this->log('Database cleanup completed');
            
        } catch (Exception $e) {
            $this->log('Database cleanup failed: ' . $e->getMessage(), 'ERROR');
        }
    }
    
    // Logging functionality
    private function createLogDirectory() {
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    private function log($message, $level = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
        
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    private function sanitizeLogQuery($sql, $params) {
        $sanitized = $sql;
        foreach ($params as $key => $value) {
            $sanitized = str_replace(":{$key}", "'{$value}'", $sanitized);
        }
        return substr($sanitized, 0, 200) . (strlen($sanitized) > 200 ? '...' : '');
    }
    
    // Statistics and analytics
    public function getSystemStats() {
        $stats = [];
        
        // User statistics
        $stats['total_users'] = $this->fetchOne("SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL")['count'];
        $stats['active_users'] = $this->fetchOne("SELECT COUNT(*) as count FROM users WHERE last_login > :date", ['date' => date('Y-m-d', strtotime('-30 days'))])['count'];
        
        // Quiz statistics
        $stats['total_quizzes'] = $this->fetchOne("SELECT COUNT(*) as count FROM quizzes WHERE deleted_at IS NULL")['count'];
        $stats['active_quizzes'] = $this->fetchOne("SELECT COUNT(*) as count FROM quizzes WHERE start_at <= NOW() AND end_at >= NOW() AND deleted_at IS NULL")['count'];
        
        // Submission statistics
        $stats['total_submissions'] = $this->fetchOne("SELECT COUNT(*) as count FROM submissions")['count'];
        $stats['completed_submissions'] = $this->fetchOne("SELECT COUNT(*) as count FROM submissions WHERE submitted_at IS NOT NULL")['count'];
        
        // Anti-cheat statistics
        $stats['total_violations'] = $this->fetchOne("SELECT COUNT(*) as count FROM anti_cheat_violations")['count'];
        $stats['recent_violations'] = $this->fetchOne("SELECT COUNT(*) as count FROM anti_cheat_violations WHERE timestamp > :date", ['date' => date('Y-m-d', strtotime('-7 days'))])['count'];
        
        return $stats;
    }
    
    // Database health check
    public function healthCheck() {
        try {
            $this->connection->query('SELECT 1');
            
            $status = [
                'database' => 'healthy',
                'connection' => 'active',
                'last_check' => date('Y-m-d H:i:s')
            ];
            
            // Check table integrity
            $tables = ['users', 'quizzes', 'questions', 'submissions', 'answers'];
            foreach ($tables as $table) {
                $result = $this->fetchOne("SELECT COUNT(*) as count FROM {$table}");
                $status['tables'][$table] = $result ? 'healthy' : 'error';
            }
            
            return $status;
            
        } catch (Exception $e) {
            return [
                'database' => 'error',
                'connection' => 'failed',
                'error' => $e->getMessage(),
                'last_check' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    /**
     * Enable CORS headers for API requests
     */
    public function enableCors() {
        // Allow requests from any origin in development
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Max-Age: 86400");
        
        // Set content type for API responses
        header("Content-Type: application/json; charset=UTF-8");
    }
    
    /**
     * Send standardized JSON response
     */
    public function jsonResponse($status_code, $success, $message, $data = null) {
        http_response_code($status_code);
        
        $response = [
            'success' => $success,
            'message' => $message,
            'timestamp' => date('c'),
            'status_code' => $status_code
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        return json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
    
    /**
     * Get user by email
     */
    public function getUserByEmail($email) {
        try {
            $sql = "SELECT * FROM users WHERE email = :email AND deleted_at IS NULL";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute(['email' => $email]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting user by email: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get user by ID
     */
    public function getUserById($id) {
        try {
            $sql = "SELECT * FROM users WHERE id = :id AND deleted_at IS NULL";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute(['id' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting user by ID: " . $e->getMessage());
            return false;
        }
    }
    
    public function __destruct() {
        $this->connection = null;
    }
}

// Response utilities
class ApiResponse {
    public static function success($data = null, $message = 'Success') {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ]);
        exit;
    }
    
    public static function error($message = 'Error', $code = 400, $details = null) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'details' => $details,
            'timestamp' => date('c')
        ]);
        exit;
    }
    
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }
    
    public static function forbidden($message = 'Forbidden') {
        self::error($message, 403);
    }
    
    public static function notFound($message = 'Not Found') {
        self::error($message, 404);
    }
    
    public static function serverError($message = 'Internal Server Error') {
        self::error($message, 500);
    }
}

// CORS handling
function handleCORS() {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
            header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        }
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        }
        
        exit(0);
    }
}

// Initialize CORS for all API requests
handleCORS();

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');

// Global database instance
$database = new Database();

?>
