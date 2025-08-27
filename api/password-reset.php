<?php
/**
 * Password Reset API for 3D Anti-Cheat Quiz System
 * Handles forgot password and reset password functionality
 */

require_once 'config.php';
require_once 'database.php';

class PasswordResetAPI {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'POST':
                return $this->handlePost();
            case 'GET':
                return $this->handleGet();
            default:
                http_response_code(405);
                return ['success' => false, 'message' => 'Method not allowed'];
        }
    }
    
    private function handlePost() {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'request_reset':
                return $this->requestPasswordReset($input);
            case 'reset_password':
                return $this->resetPassword($input);
            default:
                return ['success' => false, 'message' => 'Invalid action'];
        }
    }
    
    private function handleGet() {
        $token = $_GET['token'] ?? '';
        
        if (empty($token)) {
            return ['success' => false, 'message' => 'Token required'];
        }
        
        return $this->validateResetToken($token);
    }
    
    private function requestPasswordReset($data) {
        $email = sanitizeInput($data['email'] ?? '');
        
        if (empty($email) || !validateEmail($email)) {
            return ['success' => false, 'message' => 'Valid email required'];
        }
        
        try {
            // Check if user exists
            $user = $this->db->query(
                "SELECT id, name, email FROM users WHERE email = ? AND active = 1",
                [$email]
            );
            
            if (empty($user)) {
                // Don't reveal if email exists for security
                return [
                    'success' => true, 
                    'message' => 'If the email exists, a reset link has been sent'
                ];
            }
            
            $user = $user[0];
            
            // Generate secure reset token
            $token = bin2hex(random_bytes(32));
            $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            // Store reset token
            $this->db->query(
                "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
                [$user['id'], $token, $expires_at]
            );
            
            // In a real application, send email here
            // For demo purposes, we'll return the token
            if (ENABLE_DEMO_MODE) {
                return [
                    'success' => true,
                    'message' => 'Password reset requested successfully',
                    'demo_reset_link' => "http://localhost/reset-password.html?token=$token"
                ];
            }
            
            // Send email (implement your email service)
            $this->sendResetEmail($user, $token);
            
            return [
                'success' => true,
                'message' => 'If the email exists, a reset link has been sent'
            ];
            
        } catch (Exception $e) {
            logError('Password reset request failed', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => 'An error occurred. Please try again later.'
            ];
        }
    }
    
    private function resetPassword($data) {
        $token = sanitizeInput($data['token'] ?? '');
        $newPassword = $data['password'] ?? '';
        $confirmPassword = $data['confirm_password'] ?? '';
        
        if (empty($token) || empty($newPassword) || empty($confirmPassword)) {
            return ['success' => false, 'message' => 'All fields are required'];
        }
        
        if ($newPassword !== $confirmPassword) {
            return ['success' => false, 'message' => 'Passwords do not match'];
        }
        
        if (!validatePassword($newPassword)) {
            return [
                'success' => false,
                'message' => 'Password must be at least 8 characters with uppercase, lowercase, and number'
            ];
        }
        
        try {
            // Validate token
            $resetData = $this->db->query(
                "SELECT pr.*, u.id as user_id, u.email 
                 FROM password_resets pr 
                 JOIN users u ON pr.user_id = u.id 
                 WHERE pr.token = ? AND pr.expires_at > NOW() AND pr.used = 0",
                [$token]
            );
            
            if (empty($resetData)) {
                return ['success' => false, 'message' => 'Invalid or expired reset token'];
            }
            
            $reset = $resetData[0];
            
            // Update password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            $this->db->query(
                "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
                [$hashedPassword, $reset['user_id']]
            );
            
            // Mark token as used
            $this->db->query(
                "UPDATE password_resets SET used = 1 WHERE id = ?",
                [$reset['id']]
            );
            
            // Log activity
            $this->db->query(
                "INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
                [
                    $reset['user_id'],
                    'password_reset',
                    json_encode(['method' => 'reset_token']),
                    $_SERVER['REMOTE_ADDR'] ?? null
                ]
            );
            
            return [
                'success' => true,
                'message' => 'Password reset successfully. You can now login with your new password.'
            ];
            
        } catch (Exception $e) {
            logError('Password reset failed', [
                'token' => $token,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => 'An error occurred. Please try again later.'
            ];
        }
    }
    
    private function validateResetToken($token) {
        try {
            $resetData = $this->db->query(
                "SELECT pr.*, u.email 
                 FROM password_resets pr 
                 JOIN users u ON pr.user_id = u.id 
                 WHERE pr.token = ? AND pr.expires_at > NOW() AND pr.used = 0",
                [$token]
            );
            
            if (empty($resetData)) {
                return ['success' => false, 'message' => 'Invalid or expired reset token'];
            }
            
            return [
                'success' => true,
                'message' => 'Valid reset token',
                'email' => $resetData[0]['email']
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Token validation failed'];
        }
    }
    
    private function sendResetEmail($user, $token) {
        // In demo mode, we don't actually send emails
        if (ENABLE_DEMO_MODE) {
            logError('Email sending skipped - Demo mode enabled', [
                'email' => $user['email'],
                'token' => substr($token, 0, 8) . '...'
            ]);
            return true;
        }
        
        // Use correct local development URL
        $resetLink = "http://localhost/reset-password.html?token=$token";
        $subject = "Password Reset - CyberQuiz 3D";
        
        // HTML email message
        $message = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
                .header { text-align: center; color: #00ffff; margin-bottom: 30px; }
                .content { color: #333; line-height: 1.6; }
                .button { display: inline-block; padding: 12px 24px; background: linear-gradient(45deg, #00ffff, #ff00ff); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>🚀 CyberQuiz 3D - Password Reset</h2>
                </div>
                <div class='content'>
                    <p>Hello <strong>{$user['name']}</strong>,</p>
                    <p>You requested a password reset for your CyberQuiz 3D account.</p>
                    <p>Click the button below to reset your password:</p>
                    <p><a href='$resetLink' class='button'>Reset Password</a></p>
                    <p>Or copy and paste this link in your browser:<br>
                    <code>$resetLink</code></p>
                    <p><strong>⚠️ This link will expire in 1 hour for security.</strong></p>
                    <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
                </div>
                <div class='footer'>
                    <p>This is an automated message from CyberQuiz 3D System.<br>
                    Do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        // Set headers for HTML email
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . MAIL_FROM_NAME . ' <' . MAIL_FROM_ADDRESS . '>',
            'Reply-To: ' . MAIL_FROM_ADDRESS,
            'X-Mailer: PHP/' . phpversion()
        ];
        
        try {
            // Use PHP's built-in mail function (for development)
            // In production, use PHPMailer or a service like SendGrid
            $sent = mail($user['email'], $subject, $message, implode("\r\n", $headers));
            
            if ($sent) {
                logError('Password reset email sent successfully', [
                    'email' => $user['email'],
                    'token' => substr($token, 0, 8) . '...'
                ]);
                return true;
            } else {
                logError('Failed to send password reset email', [
                    'email' => $user['email'],
                    'error' => 'mail() function returned false'
                ]);
                return false;
            }
        } catch (Exception $e) {
            logError('Email sending exception', [
                'email' => $user['email'],
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}

// Initialize and handle request
try {
    $api = new PasswordResetAPI();
    $response = $api->handleRequest();
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
