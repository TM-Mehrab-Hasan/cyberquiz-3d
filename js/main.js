/**
 * Main Application Controller for 3D Anti-Cheat Quiz System
 * Coordinates between 3D scene, anti-cheat system, and UI components
 */

class QuizApp {
    constructor() {
        this.currentUser = null;
        this.currentQuiz = null;
        this.isInQuizMode = false;
        this.particles = [];
        this.audioContext = null;
        this.spatialAudio = null;
        
        this.init();
    }
    
    init() {
        this.setupUI();
        this.initializeParticles();
        this.initializeAudio();
        this.setupAnimations();
        console.log('Quiz Application initialized');
    }
    
    setupUI() {
        // Initialize UI components and event listeners
        this.setupThemeToggle();
        this.setupNavigation();
        this.setupModals();
        this.setupResponsiveDesign();
    }
    
    setupThemeToggle() {
        // Theme switching functionality
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
            });
        }
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
    
    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    setupModals() {
        // Modal functionality
        this.modals = {
            login: document.getElementById('loginModal')
        };
        
        // Close modal when clicking backdrop
        Object.values(this.modals).forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.hideModal(modal);
                    }
                });
            }
        });
        
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
    
    setupResponsiveDesign() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Initial resize
        this.handleResize();
    }
    
    handleResize() {
        // Update particle system for new screen size
        this.updateParticleSystem();
        
        // Update 3D scene if exists
        if (window.threeScene) {
            window.threeScene.handleResize();
        }
    }
    
    initializeParticles() {
        this.createFloatingParticles();
        this.animateParticles();
    }
    
    createFloatingParticles() {
        const particleContainer = document.getElementById('particleBackground');
        if (!particleContainer) return;
        
        // Clear existing particles
        particleContainer.innerHTML = '';
        this.particles = [];
        
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random starting position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            
            // Random size and color
            const size = Math.random() * 3 + 1;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            const hue = Math.random() * 60 + 200; // Blue to cyan range
            particle.style.background = `hsl(${hue}, 80%, 60%)`;
            particle.style.boxShadow = `0 0 ${size * 2}px hsl(${hue}, 80%, 60%)`;
            
            particleContainer.appendChild(particle);
            this.particles.push({
                element: particle,
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 1,
                size: size,
                hue: hue
            });
        }
    }
    
    animateParticles() {
        const animate = () => {
            this.particles.forEach(particle => {
                particle.y += particle.vy;
                particle.x += particle.vx;
                
                // Reset particle when it goes off screen
                if (particle.y < -10 || particle.x < -10 || particle.x > window.innerWidth + 10) {
                    particle.x = Math.random() * window.innerWidth;
                    particle.y = window.innerHeight + 10;
                    particle.vx = (Math.random() - 0.5) * 2;
                    particle.vy = -Math.random() * 3 - 1;
                }
                
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
            });
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    updateParticleSystem() {
        // Recreate particles for new screen size
        this.createFloatingParticles();
    }
    
    initializeAudio() {
        // Initialize spatial audio for 3D environment
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.spatialAudio = this.audioContext.createPanner();
            this.spatialAudio.panningModel = 'HRTF';
            this.spatialAudio.distanceModel = 'inverse';
            this.spatialAudio.refDistance = 1;
            this.spatialAudio.maxDistance = 10000;
            this.spatialAudio.rolloffFactor = 1;
            this.spatialAudio.coneInnerAngle = 360;
            this.spatialAudio.coneOuterAngle = 0;
            this.spatialAudio.coneOuterGain = 0;
            
            this.spatialAudio.connect(this.audioContext.destination);
            
            console.log('Spatial audio initialized');
        } catch (error) {
            console.warn('Could not initialize spatial audio:', error);
        }
    }
    
    setupAnimations() {
        // Setup GSAP animations for enhanced UI
        if (typeof gsap !== 'undefined') {
            this.setupGSAPAnimations();
        }
        
        // Intersection Observer for scroll animations
        this.setupScrollAnimations();
    }
    
    setupGSAPAnimations() {
        // Animate hero elements on load
        gsap.from('.hero h1', {
            duration: 1.5,
            y: 100,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.5
        });
        
        gsap.from('.hero p', {
            duration: 1.2,
            y: 50,
            opacity: 0,
            ease: 'power3.out',
            delay: 0.8
        });
        
        gsap.from('.hero button', {
            duration: 1,
            y: 30,
            opacity: 0,
            ease: 'power3.out',
            delay: 1.1,
            stagger: 0.2
        });
        
        // Floating animation for hero card
        gsap.to('.hero-card', {
            duration: 4,
            y: -20,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger specific animations based on element type
                    if (entry.target.classList.contains('feature-card')) {
                        this.animateFeatureCard(entry.target);
                    } else if (entry.target.classList.contains('stat-card')) {
                        this.animateStatCard(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.feature-card, .stat-card, .glass-effect').forEach(el => {
            observer.observe(el);
        });
    }
    
    animateFeatureCard(card) {
        if (typeof gsap !== 'undefined') {
            gsap.from(card, {
                duration: 0.8,
                y: 50,
                opacity: 0,
                scale: 0.9,
                ease: 'power3.out'
            });
            
            // Animate the icon
            const icon = card.querySelector('.text-5xl');
            if (icon) {
                gsap.from(icon, {
                    duration: 1,
                    scale: 0,
                    rotation: 360,
                    ease: 'back.out(1.7)',
                    delay: 0.3
                });
            }
        }
    }
    
    animateStatCard(card) {
        if (typeof gsap !== 'undefined') {
            const number = card.querySelector('.text-3xl');
            if (number) {
                // Animate number counting up
                const endValue = parseInt(number.textContent) || 0;
                const obj = { value: 0 };
                
                gsap.to(obj, {
                    duration: 2,
                    value: endValue,
                    ease: 'power2.out',
                    onUpdate: () => {
                        number.textContent = Math.round(obj.value) + (number.textContent.includes('%') ? '%' : '');
                    }
                });
            }
        }
    }
    
    // Demo functionality
    async initDemo() {
        console.log('Initializing 3D demo...');
        
        const demoCanvas = document.getElementById('demoCanvas');
        if (!demoCanvas) return;
        
        // Create demo scene
        const demoScene = new DemoScene(demoCanvas);
        await demoScene.init();
        
        // Update canvas content
        demoCanvas.innerHTML = '<canvas id="demo3d" style="width: 100%; height: 100%;"></canvas>';
        
        // Show demo controls
        this.showDemoControls();
    }
    
    showDemoControls() {
        // Add demo-specific UI elements
        const controls = document.createElement('div');
        controls.className = 'demo-controls fixed bottom-4 left-4 space-x-2 z-50';
        controls.innerHTML = `
            <button onclick="quizApp.exitDemo()" class="glass-effect text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all">
                Exit Demo
            </button>
            <button onclick="quizApp.toggleDemoVR()" class="glass-effect text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all">
                Toggle VR
            </button>
        `;
        document.body.appendChild(controls);
    }
    
    exitDemo() {
        // Clean up demo
        document.querySelector('.demo-controls')?.remove();
        
        // Reset demo canvas
        const demoCanvas = document.getElementById('demoCanvas');
        if (demoCanvas) {
            demoCanvas.innerHTML = `
                <div class="text-center">
                    <div class="text-6xl mb-4 animate-float">🎮</div>
                    <h3 class="text-2xl font-bold text-white mb-4">3D Demo Environment</h3>
                    <p class="text-gray-300 mb-6">Click to enter the immersive 3D quiz space</p>
                    <button onclick="initDemo()" class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105">
                        🚀 Launch 3D Demo
                    </button>
                </div>
            `;
        }
    }
    
    toggleDemoVR() {
        if (window.threeScene) {
            window.threeScene.enableVRMode();
        }
        console.log('VR mode toggled');
    }
    
    // Login functionality
    showLoginModal() {
        const modal = this.modals.login;
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            
            // Focus first input
            const firstInput = modal.querySelector('input[type="email"]');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    hideLoginModal() {
        const modal = this.modals.login;
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }
    
    hideModal(modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
    
    hideAllModals() {
        Object.values(this.modals).forEach(modal => {
            if (modal) {
                this.hideModal(modal);
            }
        });
    }
    
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const credentials = {
            email: formData.get('email') || event.target.querySelector('input[type="email"]').value,
            password: formData.get('password') || event.target.querySelector('input[type="password"]').value,
            role: formData.get('role') || event.target.querySelector('select').value
        };
        
        console.log('Login attempt:', credentials);
        
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Authenticating...';
        submitButton.disabled = true;
        
        try {
            // Simulate login process
            await this.simulateLogin(credentials);
            
            // Store user data
            this.currentUser = {
                email: credentials.email,
                role: credentials.role,
                name: credentials.email.split('@')[0]
            };
            
            // Hide modal
            this.hideLoginModal();
            
            // Redirect based on role
            this.redirectToDashboard(credentials.role);
            
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('Login failed. Please check your credentials.');
        } finally {
            // Restore button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    async simulateLogin(credentials) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo credentials check
                const demoAccounts = {
                    'demo@student.com': { password: 'demo123', role: 'student' },
                    'demo@teacher.com': { password: 'demo123', role: 'teacher' },
                    'demo@admin.com': { password: 'demo123', role: 'admin' }
                };
                
                const account = demoAccounts[credentials.email];
                if (account && account.password === credentials.password) {
                    resolve(account);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1500);
        });
    }
    
    redirectToDashboard(role) {
        const dashboards = {
            student: 'student-dashboard.html',
            teacher: 'teacher-dashboard.html',
            admin: 'admin-dashboard.html'
        };
        
        const dashboard = dashboards[role];
        if (dashboard) {
            console.log(`Redirecting to ${role} dashboard`);
            // In a real app, this would navigate to the appropriate page
            this.showSuccess(`Welcome! Redirecting to ${role} dashboard...`);
            
            setTimeout(() => {
                // For demo purposes, just show a message
                this.showDemo3DEnvironment(role);
            }, 2000);
        }
    }
    
    showDemo3DEnvironment(role) {
        // Create a demo 3D environment for the user
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center';
        overlay.innerHTML = `
            <div class="text-center text-white">
                <div class="text-6xl mb-6">🌐</div>
                <h2 class="text-4xl font-cyber mb-4 neon-text">Welcome to 3D Environment</h2>
                <p class="text-xl mb-6">Entering ${role} dashboard...</p>
                <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                <p class="text-gray-300">Loading immersive 3D interface...</p>
                <button onclick="this.parentElement.parentElement.remove()" class="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all">
                    Continue to Demo
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            overlay.remove();
        }, 10000);
    }
    
    fillDemo(role) {
        const emailInput = document.querySelector('#loginModal input[type="email"]');
        const passwordInput = document.querySelector('#loginModal input[type="password"]');
        const roleSelect = document.querySelector('#loginModal select');
        
        const demoCredentials = {
            student: 'demo@student.com',
            teacher: 'demo@teacher.com',
            admin: 'demo@admin.com'
        };
        
        if (emailInput) emailInput.value = demoCredentials[role];
        if (passwordInput) passwordInput.value = 'demo123';
        if (roleSelect) roleSelect.value = role;
    }
    
    // Utility methods
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    showError(message) {
        this.showToast(message, 'error');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg text-white font-semibold transform transition-all duration-300 translate-x-full opacity-0`;
        
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-600',
            info: 'bg-blue-600'
        };
        
        toast.classList.add(colors[type] || colors.info);
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    // Fullscreen functionality
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Could not enter fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // Start quiz functionality
    startDemo() {
        this.initDemo();
    }
}

// Simple demo scene class
class DemoScene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }
    
    async init() {
        // This would create a simple 3D scene for demo purposes
        console.log('Demo scene initialized');
        return Promise.resolve();
    }
}

// Global app instance
let quizApp;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    quizApp = new QuizApp();
    window.quizApp = quizApp; // Make globally accessible
});

// Global functions for HTML onclick handlers
function showLoginModal() {
    if (quizApp) quizApp.showLoginModal();
}

function hideLoginModal() {
    if (quizApp) quizApp.hideLoginModal();
}

function handleLogin(event) {
    if (quizApp) return quizApp.handleLogin(event);
}

function fillDemo(role) {
    if (quizApp) quizApp.fillDemo(role);
}

function startDemo() {
    if (quizApp) quizApp.startDemo();
}

function initDemo() {
    if (quizApp) quizApp.initDemo();
}

function toggleFullscreen() {
    if (quizApp) quizApp.toggleFullscreen();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizApp;
}
