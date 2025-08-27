# 🎮 CyberQuiz 3D - Next-Generation Anti-Cheat Quiz Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-blue.svg)](https://php.net)
[![Three.js](https://img.shields.io/badge/Three.js-r156-green.svg)](https://threejs.org)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red.svg)](https://www.khronos.org/webgl/)

> A revolutionary educational platform combining immersive 3D environments with cutting-edge anti-cheat technology for secure, engaging online assessments.

## 🌟 Why CyberQuiz 3D?

Transform traditional online testing with **cyberpunk-themed 3D environments**, **real-time monitoring**, and **VR compatibility**. Perfect for educational institutions, corporate training, and certification programs requiring maximum security and engagement.

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/YourUsername/cyberquiz-3d.git

# Setup with XAMPP/WAMP
1. Place in htdocs/
2. Import database.sql
3. Configure api/config.php
4. Access: http://localhost/cyberquiz-3d/
```

## 🚀 Features Overview

### 🎯 Immersive Learning Experience
- **🌐 3D Virtual Classrooms**: Interactive Three.js environments with spatial audio
- **🥽 VR/AR Ready**: WebXR support for Meta Quest, HoloLens, and mobile VR
- **🎨 Cyberpunk Aesthetics**: Neon-themed UI with animated particle systems
- **📱 Cross-Platform**: Responsive design for desktop, tablet, and mobile

### 🛡️ Advanced Anti-Cheat System
- **👁️ Eye Tracking Simulation**: Monitor gaze patterns and attention
- **🤚 Gesture Detection**: Track suspicious hand movements and interactions
- **🔍 Environmental Monitoring**: Detect screen recording, window switching
- **⚡ Real-time Alerts**: Instant violation detection with 3-strike system
- **🤖 AI-Powered Analysis**: Machine learning behavioral pattern recognition

### 🔐 Enterprise Security
- **🔑 JWT Authentication**: Secure token-based session management
- **🛡️ Role-Based Access**: Admin, Teacher, Student with granular permissions
- **🚫 Rate Limiting**: DDoS protection and brute force prevention
- **🔒 Data Encryption**: End-to-end encrypted communications
- **📊 Audit Logging**: Comprehensive activity tracking and reporting

### 📊 Management Features
- **Admin Dashboard**: Comprehensive system monitoring and control
- **User Management**: Role-based access for students, teachers, and admins
- **Quiz Builder**: Create complex 3D quizzes with multiple question types
- **Analytics**: Detailed reporting on quiz performance and security
- **Activity Logging**: Complete audit trail of system activities

## 🛠 Technology Stack

### Frontend
- **HTML5 & CSS3**: Modern web standards
- **Tailwind CSS**: Utility-first CSS framework
- **Three.js**: 3D graphics and WebGL rendering
- **GSAP**: Advanced animations and interactions
- **Chart.js**: Data visualization and analytics

### Backend
- **PHP 8.0+**: Server-side processing
- **MySQL**: Database management with XAMPP
- **PDO**: Secure database interactions
- **JWT**: JSON Web Token authentication
- **RESTful API**: Clean API architecture

### 3D & Immersive Tech
- **WebGL**: Hardware-accelerated 3D graphics
- **WebRTC**: Camera and microphone access for monitoring
- **Web Audio API**: Spatial audio processing
- **WebXR**: VR/AR device compatibility

## 📋 Prerequisites

Before setting up the system, ensure you have:

- **XAMPP** (Apache + MySQL + PHP 8.0+)
- **Modern Web Browser** (Chrome, Firefox, Edge with WebGL support)
- **VR Headset** (optional, for VR features)
- **Webcam** (for eye tracking features)

### Required PHP Extensions
- PDO
- PDO MySQL
- JSON
- OpenSSL
- cURL
- GD (for image processing)

## 🚀 Installation

### 1. Setup XAMPP
1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start Apache and MySQL services
3. Access phpMyAdmin at `http://localhost/phpmyadmin`

### 2. Database Setup
1. Create a new database named `3d_quiz_system`
2. Import the database schema:
   ```sql
   mysql -u root -p 3d_quiz_system < database.sql
   ```
   Or use phpMyAdmin to import `database.sql`

### 3. Project Setup
1. Clone or download the project to your XAMPP htdocs folder:
   ```
   htdocs/
   └── 3d-quiz-system/
       ├── index.html
       ├── admin.html
       ├── js/
       ├── api/
       └── database.sql
   ```

2. Configure database connection in `api/config.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', '3d_quiz_system');
   define('DB_USER', 'root');
   define('DB_PASS', ''); // Your MySQL password
   ```

### 4. Permissions Setup
1. Create necessary directories:
   ```bash
   mkdir logs uploads
   chmod 755 logs uploads
   ```

2. Ensure PHP has write permissions to logs and uploads directories

## 🎮 Usage

### 1. Access the System
- **Main Interface**: `http://localhost/3d-quiz-system/`
- **Admin Dashboard**: `http://localhost/3d-quiz-system/admin.html`
- **API Base URL**: `http://localhost/3d-quiz-system/api/`

### 2. Demo Accounts
The system comes with pre-configured demo accounts:

#### Administrator
- **Email**: `admin@3dquiz.com`
- **Password**: `demo123`
- **Capabilities**: Full system access, user management, analytics

#### Teacher
- **Email**: `teacher@3dquiz.com`
- **Password**: `demo123`
- **Capabilities**: Create quizzes, manage courses, view student progress

#### Student
- **Email**: `student@3dquiz.com`
- **Password**: `demo123`
- **Capabilities**: Take quizzes, view results, access VR features

### 3. Features Guide

#### For Students
1. **Login** with student credentials
2. **Browse Available Quizzes** in the 3D environment
3. **Enable VR Mode** (if headset available)
4. **Calibrate Eye Tracking** for enhanced security
5. **Take Quizzes** with real-time anti-cheat monitoring

#### For Teachers
1. **Create Courses** with 3D environments
2. **Design Quizzes** with multiple question types
3. **Monitor Student Progress** with detailed analytics
4. **Review Security Reports** for academic integrity

#### For Administrators
1. **System Monitoring** via admin dashboard
2. **User Management** (create, edit, deactivate accounts)
3. **Security Configuration** and violation monitoring
4. **System Analytics** and performance metrics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth.php/login` - User login
- `POST /api/auth.php/register` - User registration
- `POST /api/auth.php/logout` - User logout
- `GET /api/auth.php/verify` - Token verification

### Quiz Management
- `GET /api/quiz.php` - List available quizzes
- `POST /api/quiz.php` - Create new quiz
- `GET /api/quiz.php/{id}` - Get quiz details
- `PUT /api/quiz.php/{id}` - Update quiz

### Security & Monitoring
- `POST /api/security.php/violation` - Report security violation
- `GET /api/security.php/reports` - Get security reports
- `POST /api/session.php/start` - Start quiz session
- `POST /api/session.php/end` - End quiz session

## 🎨 Customization

### 3D Environments
1. Edit `js/three-scene.js` to modify:
   - Lighting configurations
   - Camera positions
   - 3D model loading
   - Particle effects

### UI Themes
1. Modify `index.html` and CSS for:
   - Color schemes
   - Layout structures
   - Animation preferences
   - Responsive breakpoints

### Anti-Cheat Settings
1. Configure `js/anti-cheat.js` for:
   - Violation thresholds
   - Monitoring sensitivity
   - Alert mechanisms
   - Reporting frequency

## 🔒 Security Configuration

### Production Deployment
1. **Change Default Passwords**: Update all demo account passwords
2. **Update JWT Secret**: Change JWT_SECRET in config.php
3. **Enable HTTPS**: Configure SSL certificates
4. **Database Security**: Use strong MySQL passwords
5. **CORS Configuration**: Restrict allowed origins

### Anti-Cheat Levels
- **Basic**: Tab switching detection
- **Standard**: Eye tracking + behavior monitoring
- **Strict**: Full surveillance with AI analysis
- **Maximum**: VR-required with complete isolation

## 📊 Monitoring & Analytics

### System Health
- Database connection status
- Active user sessions
- Security violation counts
- Performance metrics

### Quiz Analytics
- Completion rates
- Average scores
- Time spent per question
- Cheating attempt frequency

### Security Reports
- Violation types and severity
- User behavior patterns
- System vulnerability assessments
- Incident response logs

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```
Solution: Check XAMPP MySQL service and database credentials
```

#### 3D Environment Not Loading
```
Solution: Ensure WebGL is enabled in browser settings
```

#### Eye Tracking Not Working
```
Solution: Grant camera permissions and check lighting conditions
```

#### VR Mode Unavailable
```
Solution: Use HTTPS and ensure WebXR-compatible browser
```

### Debug Mode
Enable debug mode in `api/config.php`:
```php
define('ENABLE_DEBUG_MODE', true);
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For technical support or questions:
- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Security**: Report security vulnerabilities privately

## 🔮 Future Enhancements

### Planned Features
- **AI Proctoring**: Machine learning-based cheating detection
- **Blockchain Integration**: Immutable quiz records and certificates
- **Multi-language Support**: Internationalization
- **Mobile VR Support**: Smartphone-based VR experiences
- **Advanced Analytics**: Predictive modeling and insights

### Technical Roadmap
- **Microservices Architecture**: Scalable backend services
- **Real-time Collaboration**: Multi-user 3D environments
- **Edge Computing**: Reduced latency for VR experiences
- **Quantum Security**: Future-proof encryption methods

---

**Note**: This system is designed for educational purposes and demonstration. For production use, additional security hardening and performance optimization may be required.

Built with ❤️ for the future of education.
