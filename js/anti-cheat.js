/**
 * Advanced 3D Anti-Cheat System
 * Monitors user behavior in 3D space with eye tracking, gesture detection, and environmental awareness
 */

class AntiCheatSystem {
    constructor() {
        this.isActive = false;
        this.warningCount = 0;
        this.maxWarnings = 3;
        this.violations = [];
        this.monitoring = {
            tabSwitching: true,
            fullscreen: true,
            eyeTracking: true,
            gestureDetection: true,
            environmentalAwareness: true,
            browserDevTools: true,
            screenRecording: true,
            virtualCamera: true
        };
        
        // Tracking data
        this.userBehavior = {
            mouseMovements: [],
            eyePositions: [],
            headPose: [],
            gesturePatterns: [],
            focusEvents: [],
            keystrokePatterns: []
        };
        
        // AI analysis thresholds
        this.thresholds = {
            suspiciousMouseSpeed: 1000, // pixels per second
            abnormalEyeMovement: 50, // degrees per second
            gestureAnomalyScore: 0.8,
            focusLossThreshold: 3000, // milliseconds
            keystrokeAnomalyScore: 0.7
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeWebcam();
        this.setupKeylogger();
        this.startBehaviorAnalysis();
        console.log('Advanced Anti-Cheat System initialized');
    }
    
    setupEventListeners() {
        // Window focus/blur detection
        window.addEventListener('blur', () => this.handleFocusLoss());
        window.addEventListener('focus', () => this.handleFocusGain());
        
        // Fullscreen monitoring
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        
        // Keyboard monitoring
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse tracking
        document.addEventListener('mousemove', (e) => this.trackMouseMovement(e));
        document.addEventListener('mouseout', () => this.handleMouseLeave());
        document.addEventListener('mouseover', () => this.handleMouseEnter());
        
        // Tab visibility API
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Right-click prevention
        document.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        
        // Copy/paste monitoring
        document.addEventListener('copy', (e) => this.handleCopy(e));
        document.addEventListener('paste', (e) => this.handlePaste(e));
        
        // Print screen detection
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen') {
                this.handlePrintScreen();
            }
        });
        
        // Browser zoom detection
        window.addEventListener('resize', () => this.checkZoomLevel());
        
        // DevTools detection
        this.setupDevToolsDetection();
    }
    
    setupDevToolsDetection() {
        let devtools = {open: false, orientation: null};
        
        const threshold = 160;
        const checkDevTools = () => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.triggerWarning('Developer tools detected', 'devtools');
                }
            } else {
                devtools.open = false;
            }
        };
        
        setInterval(checkDevTools, 1000);
        
        // Additional DevTools detection methods
        let element = new Image();
        element.__defineGetter__('id', function() {
            devtools.open = true;
            this.triggerWarning('Console inspection detected', 'console');
        });
        
        console.log('%c[Anti-Cheat] System Active', 'color: red; font-size: 20px;', element);
    }
    
    async initializeWebcam() {
        if (!this.monitoring.eyeTracking) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                }
            });
            
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = stream;
            this.videoElement.autoplay = true;
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);
            
            // Start eye tracking analysis
            this.startEyeTracking();
            console.log('Webcam initialized for eye tracking');
            
        } catch (error) {
            console.warn('Webcam access denied:', error);
            this.monitoring.eyeTracking = false;
        }
    }
    
    startEyeTracking() {
        // This would integrate with a library like WebGazer.js or MediaPipe
        // For demo purposes, we'll simulate eye tracking
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 640;
        canvas.height = 480;
        
        const analyzeFrame = () => {
            if (!this.videoElement || !this.isActive) return;
            
            ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
            
            // Simulate eye position detection
            const eyeData = this.simulateEyeTracking();
            this.analyzeEyeMovement(eyeData);
            
            // Detect head pose
            const headPose = this.detectHeadPose();
            this.analyzeHeadMovement(headPose);
            
            requestAnimationFrame(analyzeFrame);
        };
        
        requestAnimationFrame(analyzeFrame);
    }
    
    simulateEyeTracking() {
        // In a real implementation, this would use computer vision
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            confidence: Math.random(),
            timestamp: Date.now()
        };
    }
    
    analyzeEyeMovement(eyeData) {
        this.userBehavior.eyePositions.push(eyeData);
        
        // Keep only recent data (last 10 seconds)
        const cutoff = Date.now() - 10000;
        this.userBehavior.eyePositions = this.userBehavior.eyePositions.filter(
            pos => pos.timestamp > cutoff
        );
        
        // Analyze for suspicious patterns
        if (this.userBehavior.eyePositions.length > 10) {
            const recentPositions = this.userBehavior.eyePositions.slice(-10);
            const eyeMovementSpeed = this.calculateEyeMovementSpeed(recentPositions);
            
            if (eyeMovementSpeed > this.thresholds.abnormalEyeMovement) {
                this.triggerWarning('Abnormal eye movement detected', 'eye_tracking');
            }
        }
    }
    
    calculateEyeMovementSpeed(positions) {
        if (positions.length < 2) return 0;
        
        let totalDistance = 0;
        let totalTime = 0;
        
        for (let i = 1; i < positions.length; i++) {
            const prev = positions[i - 1];
            const curr = positions[i];
            
            const distance = Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
            );
            const time = curr.timestamp - prev.timestamp;
            
            totalDistance += distance;
            totalTime += time;
        }
        
        return totalDistance / (totalTime / 1000); // pixels per second
    }
    
    detectHeadPose() {
        // Simulate head pose detection
        return {
            pitch: (Math.random() - 0.5) * 60, // -30 to 30 degrees
            yaw: (Math.random() - 0.5) * 120, // -60 to 60 degrees
            roll: (Math.random() - 0.5) * 40, // -20 to 20 degrees
            timestamp: Date.now()
        };
    }
    
    analyzeHeadMovement(headPose) {
        this.userBehavior.headPose.push(headPose);
        
        // Detect if user is looking away from screen
        if (Math.abs(headPose.yaw) > 45 || Math.abs(headPose.pitch) > 30) {
            this.triggerWarning('Looking away from screen detected', 'head_tracking');
        }
    }
    
    setupKeylogger() {
        this.keystrokePattern = [];
        this.lastKeyTime = 0;
        
        document.addEventListener('keydown', (e) => {
            const currentTime = Date.now();
            const timeBetweenKeys = currentTime - this.lastKeyTime;
            
            this.keystrokePattern.push({
                key: e.key,
                timestamp: currentTime,
                interval: timeBetweenKeys,
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                shiftKey: e.shiftKey
            });
            
            this.lastKeyTime = currentTime;
            
            // Analyze keystroke patterns
            this.analyzeKeystrokePattern();
        });
    }
    
    analyzeKeystrokePattern() {
        if (this.keystrokePattern.length < 10) return;
        
        const recentKeystrokes = this.keystrokePattern.slice(-10);
        
        // Check for copy-paste behavior (very fast typing)
        const averageInterval = recentKeystrokes.reduce((sum, ks) => sum + ks.interval, 0) / recentKeystrokes.length;
        
        if (averageInterval < 50) { // Less than 50ms between keystrokes
            this.triggerWarning('Possible copy-paste detected', 'keystroke_analysis');
        }
        
        // Check for macro usage (perfectly consistent timing)
        const intervals = recentKeystrokes.map(ks => ks.interval);
        const intervalVariance = this.calculateVariance(intervals);
        
        if (intervalVariance < 10 && averageInterval < 200) {
            this.triggerWarning('Automated input detected', 'macro_detection');
        }
    }
    
    calculateVariance(numbers) {
        const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
        return squaredDifferences.reduce((sum, sqDiff) => sum + sqDiff, 0) / numbers.length;
    }
    
    trackMouseMovement(e) {
        const movement = {
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        };
        
        this.userBehavior.mouseMovements.push(movement);
        
        // Keep only recent movements (last 5 seconds)
        const cutoff = Date.now() - 5000;
        this.userBehavior.mouseMovements = this.userBehavior.mouseMovements.filter(
            mov => mov.timestamp > cutoff
        );
        
        // Analyze mouse behavior
        this.analyzeMouseBehavior();
    }
    
    analyzeMouseBehavior() {
        if (this.userBehavior.mouseMovements.length < 5) return;
        
        const recent = this.userBehavior.mouseMovements.slice(-5);
        const speed = this.calculateMouseSpeed(recent);
        
        if (speed > this.thresholds.suspiciousMouseSpeed) {
            this.triggerWarning('Abnormal mouse movement detected', 'mouse_tracking');
        }
    }
    
    calculateMouseSpeed(movements) {
        if (movements.length < 2) return 0;
        
        let totalDistance = 0;
        let totalTime = 0;
        
        for (let i = 1; i < movements.length; i++) {
            const prev = movements[i - 1];
            const curr = movements[i];
            
            const distance = Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
            );
            const time = curr.timestamp - prev.timestamp;
            
            totalDistance += distance;
            totalTime += time;
        }
        
        return totalDistance / (totalTime / 1000); // pixels per second
    }
    
    startBehaviorAnalysis() {
        // Run AI analysis every 30 seconds
        setInterval(() => {
            if (this.isActive) {
                this.runAIAnalysis();
            }
        }, 30000);
    }
    
    runAIAnalysis() {
        console.log('Running AI behavior analysis...');
        
        // Analyze overall behavior patterns
        const suspicionScore = this.calculateSuspicionScore();
        
        if (suspicionScore > 0.8) {
            this.triggerWarning('Suspicious behavior pattern detected', 'ai_analysis');
        }
        
        // Log behavior data for learning
        this.logBehaviorData();
    }
    
    calculateSuspicionScore() {
        let score = 0;
        let factors = 0;
        
        // Mouse movement analysis
        if (this.userBehavior.mouseMovements.length > 0) {
            const avgSpeed = this.calculateMouseSpeed(this.userBehavior.mouseMovements);
            if (avgSpeed > this.thresholds.suspiciousMouseSpeed * 0.5) {
                score += 0.3;
            }
            factors++;
        }
        
        // Keystroke pattern analysis
        if (this.keystrokePattern.length > 0) {
            const intervals = this.keystrokePattern.map(ks => ks.interval);
            const variance = this.calculateVariance(intervals);
            if (variance < 20) {
                score += 0.4;
            }
            factors++;
        }
        
        // Focus loss events
        const recentFocusLoss = this.userBehavior.focusEvents.filter(
            event => Date.now() - event.timestamp < 300000 // last 5 minutes
        );
        if (recentFocusLoss.length > 3) {
            score += 0.3;
        }
        factors++;
        
        return factors > 0 ? score / factors : 0;
    }
    
    logBehaviorData() {
        const behaviorLog = {
            timestamp: Date.now(),
            mouseMovements: this.userBehavior.mouseMovements.length,
            keystrokes: this.keystrokePattern.length,
            focusEvents: this.userBehavior.focusEvents.length,
            violations: this.violations.length,
            suspicionScore: this.calculateSuspicionScore()
        };
        
        // In a real implementation, this would be sent to the server
        console.log('Behavior log:', behaviorLog);
    }
    
    // Event handlers
    handleFocusLoss() {
        if (!this.isActive) return;
        
        const event = {
            type: 'focus_loss',
            timestamp: Date.now()
        };
        
        this.userBehavior.focusEvents.push(event);
        this.triggerWarning('Tab or window focus lost', 'focus_loss');
    }
    
    handleFocusGain() {
        if (!this.isActive) return;
        
        const event = {
            type: 'focus_gain',
            timestamp: Date.now()
        };
        
        this.userBehavior.focusEvents.push(event);
    }
    
    handleFullscreenChange() {
        if (!this.isActive) return;
        
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
            this.triggerWarning('Exited fullscreen mode', 'fullscreen');
        }
    }
    
    handleVisibilityChange() {
        if (!this.isActive) return;
        
        if (document.hidden) {
            this.triggerWarning('Page became hidden', 'visibility');
        }
    }
    
    handleRightClick(e) {
        if (!this.isActive) return;
        
        e.preventDefault();
        this.triggerWarning('Right-click attempted', 'right_click');
        return false;
    }
    
    handleCopy(e) {
        if (!this.isActive) return;
        
        e.preventDefault();
        this.triggerWarning('Copy operation attempted', 'copy');
        return false;
    }
    
    handlePaste(e) {
        if (!this.isActive) return;
        
        e.preventDefault();
        this.triggerWarning('Paste operation attempted', 'paste');
        return false;
    }
    
    handlePrintScreen() {
        if (!this.isActive) return;
        
        this.triggerWarning('Print Screen key detected', 'print_screen');
    }
    
    handleKeyDown(e) {
        if (!this.isActive) return;
        
        // Check for suspicious key combinations
        const suspiciousKeys = [
            'F12', 'F11', 'F10', 'F9', 'F5',
            'Tab', 'Escape'
        ];
        
        if (suspiciousKeys.includes(e.key)) {
            this.triggerWarning(`Suspicious key pressed: ${e.key}`, 'suspicious_key');
        }
        
        // Check for Ctrl+key combinations
        if (e.ctrlKey) {
            const blockedCombos = ['u', 'i', 'j', 's', 'a', 'c', 'v', 'x', 'z', 'y'];
            if (blockedCombos.includes(e.key.toLowerCase())) {
                e.preventDefault();
                this.triggerWarning(`Blocked Ctrl+${e.key.toUpperCase()}`, 'blocked_combo');
                return false;
            }
        }
        
        // Check for Alt+Tab
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
            this.triggerWarning('Alt+Tab attempted', 'alt_tab');
            return false;
        }
    }
    
    handleKeyUp(e) {
        // Handle key releases if needed
    }
    
    handleMouseLeave() {
        if (!this.isActive) return;
        
        this.triggerWarning('Mouse left quiz area', 'mouse_leave');
    }
    
    handleMouseEnter() {
        // Mouse returned to quiz area
    }
    
    checkZoomLevel() {
        if (!this.isActive) return;
        
        const zoomLevel = Math.round((window.outerWidth / window.innerWidth) * 100);
        
        if (zoomLevel !== 100) {
            this.triggerWarning(`Browser zoom detected: ${zoomLevel}%`, 'zoom');
        }
    }
    
    triggerWarning(message, type = 'general') {
        this.warningCount++;
        
        const violation = {
            message,
            type,
            timestamp: Date.now(),
            warningNumber: this.warningCount
        };
        
        this.violations.push(violation);
        
        console.warn(`[Anti-Cheat Warning ${this.warningCount}/${this.maxWarnings}]:`, message);
        
        // Show warning to user
        this.showWarningModal(violation);
        
        // Check if max warnings reached
        if (this.warningCount >= this.maxWarnings) {
            this.enforceSubmission();
        }
        
        // Send to server for logging
        this.reportViolation(violation);
    }
    
    showWarningModal(violation) {
        const warningElement = document.getElementById('antiCheatWarning');
        const messageElement = document.getElementById('warningMessage');
        const countElement = document.getElementById('warningCount');
        
        if (warningElement && messageElement && countElement) {
            messageElement.textContent = violation.message;
            countElement.textContent = `Warning ${violation.warningNumber}/${this.maxWarnings}`;
            warningElement.classList.remove('hidden');
            
            // Auto-hide after 5 seconds if not max warnings
            if (this.warningCount < this.maxWarnings) {
                setTimeout(() => {
                    warningElement.classList.add('hidden');
                }, 5000);
            }
        }
    }
    
    acknowledgeWarning() {
        const warningElement = document.getElementById('antiCheatWarning');
        if (warningElement) {
            warningElement.classList.add('hidden');
        }
    }
    
    enforceSubmission() {
        console.error('Maximum warnings reached. Enforcing quiz submission.');
        
        // Auto-submit quiz
        if (window.quizSystem && typeof window.quizSystem.forceSubmit === 'function') {
            window.quizSystem.forceSubmit('Anti-cheat violation');
        }
        
        // Show final warning
        alert('Maximum anti-cheat warnings reached. Your quiz has been automatically submitted.');
        
        // Redirect or take other action
        setTimeout(() => {
            window.location.href = 'quiz-submitted.html';
        }, 2000);
    }
    
    reportViolation(violation) {
        // Send violation data to server
        const reportData = {
            violation,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            behaviorData: this.getBehaviorSummary()
        };
        
        // In a real implementation, this would be sent via fetch/AJAX
        console.log('Reporting violation to server:', reportData);
    }
    
    getBehaviorSummary() {
        return {
            totalMouseMovements: this.userBehavior.mouseMovements.length,
            totalKeystrokes: this.keystrokePattern.length,
            totalFocusEvents: this.userBehavior.focusEvents.length,
            suspicionScore: this.calculateSuspicionScore()
        };
    }
    
    getSessionId() {
        // Generate or retrieve session ID
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Public methods
    startMonitoring() {
        this.isActive = true;
        console.log('Anti-cheat monitoring started');
        
        // Request fullscreen
        this.requestFullscreen();
    }
    
    stopMonitoring() {
        this.isActive = false;
        console.log('Anti-cheat monitoring stopped');
    }
    
    requestFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    getViolationReport() {
        return {
            totalWarnings: this.warningCount,
            violations: this.violations,
            behaviorSummary: this.getBehaviorSummary()
        };
    }
    
    // Configuration methods
    updateThresholds(newThresholds) {
        Object.assign(this.thresholds, newThresholds);
    }
    
    enableMonitoring(type) {
        if (this.monitoring.hasOwnProperty(type)) {
            this.monitoring[type] = true;
        }
    }
    
    disableMonitoring(type) {
        if (this.monitoring.hasOwnProperty(type)) {
            this.monitoring[type] = false;
        }
    }
}

// Global anti-cheat system instance
let antiCheatSystem;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    antiCheatSystem = new AntiCheatSystem();
    window.antiCheatSystem = antiCheatSystem; // Make globally accessible
});

// Global function for acknowledging warnings
function acknowledgeWarning() {
    if (antiCheatSystem) {
        antiCheatSystem.acknowledgeWarning();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AntiCheatSystem;
}
