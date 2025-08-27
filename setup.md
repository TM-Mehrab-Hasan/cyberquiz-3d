# 3D Anti-Cheat Quiz System - Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Web Server**: XAMPP, WAMP, or LAMP stack
- **PHP**: Version 7.4 or higher
- **MySQL**: Version 5.7 or higher
- **Modern Browser**: Chrome, Firefox, Edge, or Safari with WebGL support

### Installation Steps

#### 1. Setup Web Server
```bash
# For XAMPP users
1. Download and install XAMPP from https://www.apachefriends.org/
2. Start Apache and MySQL services
3. Place this project in htdocs folder
```

#### 2. Database Setup
```sql
# Open phpMyAdmin (http://localhost/phpmyadmin)
# Create a new database named '3d_quiz_system'
# Import the database.sql file
```

#### 3. Configuration
```php
# Edit api/config.php and update database credentials:
define('DB_HOST', 'localhost');
define('DB_NAME', '3d_quiz_system');
define('DB_USER', 'root');
define('DB_PASS', '');
```

#### 4. File Permissions
```bash
# Ensure write permissions for upload directory
chmod 755 uploads/
chmod 755 logs/
```

#### 5. Access the System
```
# Open your browser and go to:
http://localhost/Anti-Cheat Quiz Website/

# Or directly to landing page:
http://localhost/Anti-Cheat Quiz Website/landing.html
```

## 🎮 Demo Accounts

### Default Login Credentials
- **Admin**: admin@3dquiz.com / admin123
- **Teacher**: teacher@3dquiz.com / teacher123  
- **Student**: student@3dquiz.com / student123

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```php
# Check api/config.php database settings
# Ensure MySQL service is running
# Verify database exists and user has privileges
```

#### 2. 3D Scene Not Loading
```javascript
# Check browser console for WebGL errors
# Ensure Three.js CDN is accessible
# Verify graphics drivers are updated
```

#### 3. File Upload Issues
```bash
# Check PHP upload limits in php.ini:
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

#### 4. CORS Errors
```php
# In api/config.php, add your domain to ALLOWED_ORIGINS:
define('ALLOWED_ORIGINS', ['http://localhost:3000', 'http://your-domain.com']);
```

## 🔧 Development Mode

### Enable Debug Mode
```php
# In api/config.php:
define('ENABLE_DEBUG_MODE', true);
define('ENABLE_DEMO_MODE', true);
```

### Browser Developer Tools
```javascript
# Open browser console to see debug logs
# Check Network tab for API calls
# Use 3D inspector for WebGL debugging
```

## 📱 Mobile Support

### Responsive Design
- The system is fully responsive
- Touch controls for mobile devices
- Optimized 3D rendering for mobile GPUs

### VR Mode
- Compatible with mobile VR headsets
- WebXR support for immersive experiences
- Gesture controls for VR interactions

## 🔒 Security Configuration

### Production Settings
```php
# In api/config.php for production:
define('ENABLE_DEBUG_MODE', false);
define('ENABLE_HTTPS_ONLY', true);
define('ENABLE_DEMO_MODE', false);
```

### SSL Certificate
```apache
# Configure HTTPS in your web server
# Update CORS settings for HTTPS
# Enable secure cookies
```

## 📊 Performance Optimization

### Web Server
```apache
# Enable compression in .htaccess:
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### Database
```sql
# Add indexes for better performance:
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_anti_cheat_violations_session_id ON anti_cheat_violations(session_id);
```

### 3D Rendering
```javascript
# Optimize Three.js performance:
- Use LOD (Level of Detail) for complex models
- Implement frustum culling
- Reduce polygon count for mobile devices
```

## 🆘 Support

### Documentation
- Check the main README.md for detailed features
- Review API documentation in api/ folder
- Study JavaScript comments for implementation details

### Community
- Report issues on GitHub
- Join our Discord for real-time support
- Check Stack Overflow for common problems

### Professional Support
- Commercial licensing available
- Custom development services
- Enterprise deployment assistance

---

**Happy Learning with 3D Technology! 🚀✨**
