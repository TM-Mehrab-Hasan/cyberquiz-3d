-- 3D Anti-Cheat Quiz System Database Schema
-- MySQL/MariaDB compatible with enhanced security and 3D features

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS `anti_cheat_violations`;
DROP TABLE IF EXISTS `quiz_sessions`;
DROP TABLE IF EXISTS `rate_limits`;
DROP TABLE IF EXISTS `3d_environments`;
DROP TABLE IF EXISTS `spatial_analytics`;
DROP TABLE IF EXISTS `gesture_logs`;
DROP TABLE IF EXISTS `eye_tracking_data`;
DROP TABLE IF EXISTS `answers`;
DROP TABLE IF EXISTS `submissions`;
DROP TABLE IF EXISTS `options`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `quizzes`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- Users table with enhanced 3D features
CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `role` enum('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
    `avatar_model` varchar(255) DEFAULT NULL,
    `vr_enabled` tinyint(1) DEFAULT 0,
    `eye_tracking_calibrated` tinyint(1) DEFAULT 0,
    `gesture_profile` json DEFAULT NULL,
    `spatial_preferences` json DEFAULT NULL,
    `active` tinyint(1) NOT NULL DEFAULT 1,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_login` timestamp NULL DEFAULT NULL,
    `deleted_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`),
    INDEX `idx_active` (`active`),
    INDEX `idx_vr_enabled` (`vr_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity logs table
CREATE TABLE `activity_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `action` varchar(255) NOT NULL,
    `details` json DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password resets table
CREATE TABLE `password_resets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `token` varchar(255) NOT NULL,
    `expires_at` timestamp NOT NULL,
    `used` tinyint(1) NOT NULL DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_token` (`token`),
    INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses table with 3D environment settings
CREATE TABLE `courses` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text,
    `teacher_id` int(11) DEFAULT NULL,
    `environment_theme` varchar(100) DEFAULT 'default',
    `vr_compatible` tinyint(1) DEFAULT 1,
    `spatial_audio_enabled` tinyint(1) DEFAULT 1,
    `environment_settings` json DEFAULT NULL,
    `active` tinyint(1) NOT NULL DEFAULT 1,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_teacher_id` (`teacher_id`),
    INDEX `idx_active` (`active`),
    INDEX `idx_vr_compatible` (`vr_compatible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments table
CREATE TABLE `enrollments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `course_id` int(11) NOT NULL,
    `student_id` int(11) NOT NULL,
    `enrolled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_enrollment` (`course_id`, `student_id`),
    INDEX `idx_course_id` (`course_id`),
    INDEX `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quizzes table with enhanced 3D features
CREATE TABLE `quizzes` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `course_id` int(11) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text,
    `start_at` timestamp NOT NULL,
    `end_at` timestamp NOT NULL,
    `duration_mins` int(11) NOT NULL DEFAULT 60,
    `environment_id` int(11) DEFAULT NULL,
    `anti_cheat_level` enum('basic', 'standard', 'strict', 'maximum') DEFAULT 'standard',
    `vr_mode_required` tinyint(1) DEFAULT 0,
    `eye_tracking_required` tinyint(1) DEFAULT 0,
    `gesture_monitoring` tinyint(1) DEFAULT 1,
    `spatial_boundaries` json DEFAULT NULL,
    `immersion_settings` json DEFAULT NULL,
    `active` tinyint(1) NOT NULL DEFAULT 1,
    `created_by` int(11) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_course_id` (`course_id`),
    INDEX `idx_start_at` (`start_at`),
    INDEX `idx_end_at` (`end_at`),
    INDEX `idx_active` (`active`),
    INDEX `idx_anti_cheat_level` (`anti_cheat_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3D Environments table
CREATE TABLE `3d_environments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `theme` varchar(100) NOT NULL,
    `model_path` varchar(500) DEFAULT NULL,
    `lighting_config` json DEFAULT NULL,
    `camera_settings` json DEFAULT NULL,
    `interaction_zones` json DEFAULT NULL,
    `ambient_sounds` json DEFAULT NULL,
    `created_by` int(11) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_theme` (`theme`),
    INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions table with 3D interaction support
CREATE TABLE `questions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `quiz_id` int(11) NOT NULL,
    `question_text` text NOT NULL,
    `type` enum('mcq', 'truefalse', 'short', '3d_interactive', 'spatial_arrangement') NOT NULL DEFAULT 'mcq',
    `correct_answer` text,
    `points` int(11) NOT NULL DEFAULT 1,
    `3d_model_path` varchar(500) DEFAULT NULL,
    `interaction_data` json DEFAULT NULL,
    `spatial_requirements` json DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
    INDEX `idx_quiz_id` (`quiz_id`),
    INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Options table (for MCQ questions)
CREATE TABLE `options` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `question_id` int(11) NOT NULL,
    `option_text` text NOT NULL,
    `3d_position` json DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
    INDEX `idx_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Submissions table with enhanced tracking
CREATE TABLE `submissions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `quiz_id` int(11) NOT NULL,
    `student_id` int(11) NOT NULL,
    `session_id` varchar(255) DEFAULT NULL,
    `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `submitted_at` timestamp NULL DEFAULT NULL,
    `warnings` int(11) NOT NULL DEFAULT 0,
    `warning_events` json DEFAULT NULL,
    `3d_session_data` json DEFAULT NULL,
    `eye_tracking_data` longtext DEFAULT NULL,
    `gesture_data` longtext DEFAULT NULL,
    `spatial_violations` json DEFAULT NULL,
    `environment_interactions` json DEFAULT NULL,
    `auto_score` decimal(10,2) DEFAULT 0.00,
    `final_score` decimal(10,2) DEFAULT 0.00,
    `manual_grade` tinyint(1) NOT NULL DEFAULT 0,
    `graded_by` int(11) DEFAULT NULL,
    `graded_at` timestamp NULL DEFAULT NULL,
    `integrity_score` decimal(5,2) DEFAULT 100.00,
    `ai_suspicion_score` decimal(5,2) DEFAULT 0.00,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`graded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    UNIQUE KEY `unique_submission` (`quiz_id`, `student_id`),
    INDEX `idx_quiz_id` (`quiz_id`),
    INDEX `idx_student_id` (`student_id`),
    INDEX `idx_submitted_at` (`submitted_at`),
    INDEX `idx_warnings` (`warnings`),
    INDEX `idx_integrity_score` (`integrity_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Answers table with 3D interaction data
CREATE TABLE `answers` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `submission_id` int(11) NOT NULL,
    `question_id` int(11) NOT NULL,
    `answer_text` text,
    `3d_interaction_data` json DEFAULT NULL,
    `spatial_coordinates` json DEFAULT NULL,
    `gesture_sequence` json DEFAULT NULL,
    `time_spent` int(11) DEFAULT NULL,
    `is_correct` tinyint(1) DEFAULT NULL,
    `awarded_points` decimal(10,2) DEFAULT NULL,
    `feedback` text,
    `ai_analysis` json DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_answer` (`submission_id`, `question_id`),
    INDEX `idx_submission_id` (`submission_id`),
    INDEX `idx_question_id` (`question_id`),
    INDEX `idx_is_correct` (`is_correct`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz sessions table for tracking active sessions
CREATE TABLE `quiz_sessions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `quiz_id` int(11) NOT NULL,
    `session_token` varchar(255) NOT NULL,
    `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ended_at` timestamp NULL DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `vr_mode` tinyint(1) DEFAULT 0,
    `device_type` varchar(100) DEFAULT NULL,
    `browser_info` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_quiz_id` (`quiz_id`),
    INDEX `idx_session_token` (`session_token`),
    INDEX `idx_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Anti-cheat violations table
CREATE TABLE `anti_cheat_violations` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `quiz_id` int(11) DEFAULT NULL,
    `session_id` int(11) DEFAULT NULL,
    `violation_type` varchar(100) NOT NULL,
    `severity` enum('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    `details` json NOT NULL,
    `3d_context` json DEFAULT NULL,
    `environmental_data` json DEFAULT NULL,
    `ai_confidence` decimal(5,2) DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`session_id`) REFERENCES `quiz_sessions`(`id`) ON DELETE SET NULL,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_quiz_id` (`quiz_id`),
    INDEX `idx_violation_type` (`violation_type`),
    INDEX `idx_severity` (`severity`),
    INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Eye tracking data table
CREATE TABLE `eye_tracking_data` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `submission_id` int(11) NOT NULL,
    `timestamp` bigint(20) NOT NULL,
    `gaze_x` decimal(10,6) DEFAULT NULL,
    `gaze_y` decimal(10,6) DEFAULT NULL,
    `pupil_diameter` decimal(8,4) DEFAULT NULL,
    `confidence` decimal(5,2) DEFAULT NULL,
    `head_pose` json DEFAULT NULL,
    `blink_detected` tinyint(1) DEFAULT 0,
    `attention_score` decimal(5,2) DEFAULT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
    INDEX `idx_submission_id` (`submission_id`),
    INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gesture logs table
CREATE TABLE `gesture_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `submission_id` int(11) NOT NULL,
    `timestamp` bigint(20) NOT NULL,
    `gesture_type` varchar(100) NOT NULL,
    `coordinates` json NOT NULL,
    `velocity` json DEFAULT NULL,
    `accuracy` decimal(5,2) DEFAULT NULL,
    `duration` int(11) DEFAULT NULL,
    `confidence` decimal(5,2) DEFAULT NULL,
    `context` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
    INDEX `idx_submission_id` (`submission_id`),
    INDEX `idx_timestamp` (`timestamp`),
    INDEX `idx_gesture_type` (`gesture_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Spatial analytics table
CREATE TABLE `spatial_analytics` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `submission_id` int(11) NOT NULL,
    `question_id` int(11) DEFAULT NULL,
    `timestamp` bigint(20) NOT NULL,
    `camera_position` json NOT NULL,
    `camera_rotation` json NOT NULL,
    `object_interactions` json DEFAULT NULL,
    `spatial_violations` json DEFAULT NULL,
    `focus_time` int(11) DEFAULT NULL,
    `navigation_path` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
    INDEX `idx_submission_id` (`submission_id`),
    INDEX `idx_question_id` (`question_id`),
    INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rate limiting table
CREATE TABLE `rate_limits` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `identifier` varchar(255) NOT NULL,
    `action` varchar(100) NOT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_identifier_action` (`identifier`, `action`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert demo data
INSERT INTO `users` (`name`, `email`, `password`, `role`, `vr_enabled`, `eye_tracking_calibrated`) VALUES
('System Administrator', 'admin@cyberquiz.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 1),
('Dr. Sarah Johnson', 'teacher@cyberquiz.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 1, 1),
('Alex Rodriguez', 'student@cyberquiz.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 0, 0),
('Michael Chen', 'student2@cyberquiz.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 1, 1),
('Prof. Emily Davis', 'teacher2@cyberquiz.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 1, 1);

INSERT INTO `3d_environments` (`name`, `theme`, `lighting_config`, `camera_settings`, `created_by`) VALUES
('Cyber Classroom', 'cyberpunk', '{"ambient": {"color": "#2080ff", "intensity": 0.3}, "directional": {"color": "#ffffff", "intensity": 0.8}}', '{"position": {"x": 0, "y": 5, "z": 15}, "fov": 75}', 1),
('Space Station Lab', 'space', '{"ambient": {"color": "#4040ff", "intensity": 0.2}, "point_lights": [{"color": "#00ff88", "intensity": 0.5}]}', '{"position": {"x": 10, "y": 10, "z": 20}, "fov": 60}', 1),
('Virtual Auditorium', 'academic', '{"ambient": {"color": "#ffffff", "intensity": 0.4}, "spot": {"color": "#ffff80", "intensity": 1.0}}', '{"position": {"x": 0, "y": 8, "z": 12}, "fov": 70}', 2);

INSERT INTO `courses` (`name`, `description`, `teacher_id`, `environment_theme`, `vr_compatible`, `spatial_audio_enabled`) VALUES
('Advanced Computer Graphics', '3D modeling and rendering techniques in immersive environments', 2, 'cyberpunk', 1, 1),
('Spatial Computing Fundamentals', 'Introduction to VR/AR development and spatial interfaces', 2, 'space', 1, 1),
('Digital Innovation Lab', 'Hands-on experience with emerging technologies', 5, 'academic', 1, 1),
('Interactive Media Design', 'Creating engaging 3D experiences and interfaces', 5, 'cyberpunk', 1, 1);

INSERT INTO `enrollments` (`course_id`, `student_id`) VALUES
(1, 3), (1, 4),
(2, 3), (2, 4),
(3, 3),
(4, 4);

INSERT INTO `quizzes` (`course_id`, `title`, `description`, `start_at`, `end_at`, `duration_mins`, `anti_cheat_level`, `vr_mode_required`, `eye_tracking_required`, `created_by`) VALUES
(1, '3D Modeling Fundamentals', 'Test your understanding of basic 3D modeling concepts in an immersive environment', 
 DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 45, 'standard', 0, 1, 2),
(1, 'Advanced Rendering Techniques', 'Explore complex rendering methods in VR space', 
 NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 60, 'strict', 1, 1, 2),
(2, 'Spatial Interface Design', 'Design principles for 3D user interfaces', 
 DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 50, 'maximum', 1, 1, 2),
(3, 'Emerging Tech Assessment', 'Comprehensive evaluation of technology trends', 
 NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 90, 'standard', 0, 0, 5);

INSERT INTO `questions` (`quiz_id`, `question_text`, `type`, `correct_answer`, `points`) VALUES
-- Quiz 1: 3D Modeling Fundamentals
(1, 'Which 3D transformation is used to change the size of an object?', 'mcq', '2', 3),
(1, 'In 3D space, objects have depth in addition to width and height.', 'truefalse', 'true', 2),
(1, 'Explain the difference between vertices, edges, and faces in 3D modeling.', 'short', '', 5),

-- Quiz 2: Advanced Rendering
(2, 'What is ray tracing primarily used for in 3D rendering?', 'mcq', '1', 4),
(2, 'Global illumination affects only direct lighting in a scene.', 'truefalse', 'false', 2),
(2, 'Arrange these 3D objects by complexity from simple to complex.', '3d_interactive', '{"order": ["cube", "sphere", "torus", "suzanne"]}', 6),

-- Quiz 3: Spatial Interface Design
(3, 'Which gesture is most natural for object selection in VR?', 'mcq', '3', 3),
(3, 'Spatial interfaces should minimize eye strain and motion sickness.', 'truefalse', 'true', 2),
(3, 'Position the UI elements optimally in 3D space for accessibility.', 'spatial_arrangement', '{"optimal_positions": [{"x": 0, "y": 1.5, "z": -2}]}', 8),

-- Quiz 4: Emerging Tech
(4, 'What does XR stand for in technology?', 'mcq', '2', 2),
(4, 'Artificial Intelligence can enhance anti-cheat systems.', 'truefalse', 'true', 1),
(4, 'Describe three applications of spatial computing in education.', 'short', '', 6);

INSERT INTO `options` (`question_id`, `option_text`) VALUES
-- Question 1 options
(1, 'Translation'),
(1, 'Scaling'),
(1, 'Rotation'),
(1, 'Shearing'),

-- Question 4 options
(4, 'Realistic lighting simulation'),
(4, 'Texture mapping'),
(4, 'Polygon reduction'),
(4, 'Animation keyframing'),

-- Question 7 options
(7, 'Pointing with finger'),
(7, 'Voice command'),
(7, 'Gaze and pinch'),
(7, 'Controller button'),

-- Question 10 options
(10, 'Extended Reality'),
(10, 'Cross Reality'),
(10, 'Extra Reality'),
(10, 'Extreme Reality');

-- Sample submissions for demonstration
INSERT INTO `submissions` (`quiz_id`, `student_id`, `started_at`, `submitted_at`, `warnings`, `3d_session_data`, `auto_score`, `final_score`, `integrity_score`) VALUES
(1, 3, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 1, '{"vr_mode": false, "interactions": 45, "avg_response_time": 12.5}', 8.0, 8.0, 95.5),
(1, 4, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 0, '{"vr_mode": true, "interactions": 67, "avg_response_time": 8.2}', 9.5, 9.5, 100.0),
(3, 3, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 2, '{"vr_mode": true, "interactions": 23, "avg_response_time": 18.7}', 6.0, 6.5, 85.0);

INSERT INTO `answers` (`submission_id`, `question_id`, `answer_text`, `3d_interaction_data`, `is_correct`, `awarded_points`) VALUES
-- Student 3's answers for Quiz 1
(1, 1, '2', '{"selection_time": 3.2, "confidence": 0.85}', 1, 3.0),
(1, 2, 'true', '{"gaze_duration": 5.1, "head_movement": "minimal"}', 1, 2.0),
(1, 3, 'Vertices are points, edges connect vertices, faces are surfaces bounded by edges.', '{"typing_pattern": "consistent", "pause_analysis": "normal"}', 1, 3.0),

-- Student 4's answers for Quiz 1
(2, 1, '2', '{"selection_time": 2.1, "confidence": 0.95, "vr_gesture": "point_and_select"}', 1, 3.0),
(2, 2, 'true', '{"gaze_duration": 2.8, "head_movement": "stable", "vr_nod": true}', 1, 2.0),
(2, 3, 'In 3D modeling: vertices are corner points defining object geometry, edges are lines connecting vertices, and faces are flat surfaces enclosed by edges that define the object surface.', '{"typing_pattern": "fluid", "vr_text_input": true}', 1, 4.5),

-- Student 3's answers for Quiz 3
(3, 7, '3', '{"vr_gesture_used": true, "selection_accuracy": 0.92}', 1, 3.0),
(3, 8, 'true', '{"comfort_level": "medium", "motion_detected": false}', 1, 2.0),
(3, 9, '{"positions": [{"x": 0.2, "y": 1.4, "z": -1.8}]}', '{"spatial_reasoning_score": 0.75, "time_spent": 45.3}', 0, 1.5);

-- Sample anti-cheat violations
INSERT INTO `anti_cheat_violations` (`user_id`, `quiz_id`, `violation_type`, `severity`, `details`, `3d_context`) VALUES
(3, 1, 'gaze_deviation', 'medium', '{"duration": 3.2, "direction": "left", "frequency": 2}', '{"head_pose": {"pitch": -15, "yaw": 45}}'),
(3, 3, 'unusual_gesture', 'high', '{"gesture": "rapid_pointing", "frequency": 8, "pattern": "repetitive"}', '{"controller_position": {"x": 0.5, "y": 1.2, "z": -0.8}}'),
(4, 1, 'environment_manipulation', 'critical', '{"action": "attempted_object_deletion", "target": "quiz_interface"}', '{"scene_state": "modified", "integrity_compromised": true}');

-- Sample eye tracking data
INSERT INTO `eye_tracking_data` (`submission_id`, `timestamp`, `gaze_x`, `gaze_y`, `confidence`, `attention_score`) VALUES
(1, UNIX_TIMESTAMP(NOW()) * 1000, 512.5, 384.2, 95.5, 87.2),
(1, UNIX_TIMESTAMP(NOW()) * 1000 + 100, 518.1, 390.8, 94.2, 89.1),
(2, UNIX_TIMESTAMP(NOW()) * 1000, 640.0, 360.0, 98.1, 95.5),
(2, UNIX_TIMESTAMP(NOW()) * 1000 + 100, 635.5, 365.2, 97.8, 94.2);

-- All demo passwords are 'admin123' for admin, 'teacher123' for teachers, 'student123' for students
-- Default admin credentials: admin@cyberquiz.com / admin123
-- Default teacher credentials: teacher@cyberquiz.com / teacher123  
-- Default student credentials: student@cyberquiz.com / student123
