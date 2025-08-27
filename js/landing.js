/**
 * Landing Page JavaScript for 3D Anti-Cheat Quiz System
 * Handles authentication, role selection, and 3D background
 */

class LandingPageManager {
    constructor() {
        this.currentUser = null;
        this.selectedRole = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        
        this.init();
    }
    
    init() {
        console.log('Initializing Landing Page Manager...');
        this.setupThreeJS();
        this.setupEventListeners();
        this.animateParticles();
        this.showWelcomeAnimation();
        console.log('Landing Page Manager initialized successfully');
    }
    
    setupThreeJS() {
        try {
            // Check if Three.js is loaded
            if (typeof THREE === 'undefined') {
                console.error('Three.js is not loaded');
                return;
            }
            
            // Check if canvas exists
            const canvas = document.getElementById('three-canvas');
            if (!canvas) {
                console.error('Canvas element not found');
                return;
            }
            
            // Scene setup
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                alpha: true,
                antialias: true 
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x000000, 0);
            
            // Create particles
            this.createParticles();
            
            // Create floating geometric shapes
            this.createFloatingShapes();
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            this.scene.add(ambientLight);
            
            const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
            pointLight.position.set(10, 10, 10);
            this.scene.add(pointLight);
            
            // Camera position
            this.camera.position.z = 30;
            
            // Start render loop
            this.animate();
            
            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            console.log('Three.js setup completed successfully');
        } catch (error) {
            console.error('Error setting up Three.js:', error);
        }
    }
    
    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const colorOptions = [
            new THREE.Color(0x00ff88),
            new THREE.Color(0x0088ff),
            new THREE.Color(0xff0088),
            new THREE.Color(0x8800ff)
        ];
        
        for (let i = 0; i < particleCount; i++) {
            // Position
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            
            // Color
            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.7
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createFloatingShapes() {
        // Create various geometric shapes
        const shapes = [
            { geometry: new THREE.BoxGeometry(2, 2, 2), color: 0x00ff88 },
            { geometry: new THREE.SphereGeometry(1.5, 16, 16), color: 0x0088ff },
            { geometry: new THREE.ConeGeometry(1, 3, 8), color: 0xff0088 },
            { geometry: new THREE.OctahedronGeometry(1.5), color: 0x8800ff }
        ];
        
        shapes.forEach((shape, index) => {
            const material = new THREE.MeshPhongMaterial({ 
                color: shape.color,
                transparent: true,
                opacity: 0.3,
                wireframe: true
            });
            
            const mesh = new THREE.Mesh(shape.geometry, material);
            
            // Random position
            mesh.position.x = (Math.random() - 0.5) * 50;
            mesh.position.y = (Math.random() - 0.5) * 50;
            mesh.position.z = (Math.random() - 0.5) * 50;
            
            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.rotation.z = Math.random() * Math.PI;
            
            this.scene.add(mesh);
            
            // Store reference for animation
            mesh.userData = { 
                rotationSpeed: (Math.random() + 0.5) * 0.01,
                floatSpeed: (Math.random() + 0.5) * 0.005
            };
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate particles
        if (this.particles) {
            this.particles.rotation.x += 0.001;
            this.particles.rotation.y += 0.002;
        }
        
        // Animate floating shapes
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.x += child.userData.rotationSpeed;
                child.rotation.y += child.userData.rotationSpeed;
                child.position.y += Math.sin(Date.now() * child.userData.floatSpeed) * 0.01;
            }
        });
        
        // Camera movement based on mouse
        if (this.mouseX !== undefined && this.mouseY !== undefined) {
            this.camera.position.x += (this.mouseX * 0.01 - this.camera.position.x) * 0.05;
            this.camera.position.y += (-this.mouseY * 0.01 - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    animateParticles() {
        // Mouse interaction with particles
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX - window.innerWidth / 2) / 100;
            this.mouseY = (event.clientY - window.innerHeight / 2) / 100;
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    setupEventListeners() {
        // Modal controls
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const getStartedBtn = document.getElementById('get-started-btn');
        const demoBtn = document.getElementById('demo-btn');
        
        if (loginBtn) loginBtn.addEventListener('click', () => this.showLoginModal());
        if (signupBtn) signupBtn.addEventListener('click', () => this.showSignupModal());
        if (getStartedBtn) getStartedBtn.addEventListener('click', () => this.showSignupModal());
        if (demoBtn) demoBtn.addEventListener('click', () => this.showDemoModal());
        
        // Close modals
        const closeLogin = document.getElementById('close-login');
        const closeSignup = document.getElementById('close-signup');
        if (closeLogin) closeLogin.addEventListener('click', () => this.hideLoginModal());
        if (closeSignup) closeSignup.addEventListener('click', () => this.hideSignupModal());
        
        // Switch between modals
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToLogin = document.getElementById('switch-to-login');
        if (switchToSignup) {
            switchToSignup.addEventListener('click', () => {
                this.hideLoginModal();
                this.showSignupModal();
            });
        }
        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.hideSignupModal();
                this.showLoginModal();
            });
        }
        
        // Role selection
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => this.selectRole(card));
        });
        
        // Forms
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        if (signupForm) signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
        
        console.log('Event listeners setup completed');
    }
    
    showWelcomeAnimation() {
        try {
            if (typeof gsap !== 'undefined') {
                // Animate the hero text
                gsap.fromTo('.floating', 
                    { opacity: 0, y: 50 }, 
                    { opacity: 1, y: 0, duration: 2, ease: 'power3.out' }
                );
                
                // Animate feature cards
                gsap.fromTo('.cyber-card', 
                    { opacity: 0, scale: 0.8 }, 
                    { opacity: 1, scale: 1, duration: 1, stagger: 0.2, delay: 0.5 }
                );
                
                // Animate navigation
                gsap.fromTo('nav', 
                    { opacity: 0, y: -50 }, 
                    { opacity: 1, y: 0, duration: 1, delay: 0.3 }
                );
            } else {
                console.warn('GSAP not loaded, using CSS animations instead');
                // Fallback to CSS animations
                document.querySelectorAll('.floating, .cyber-card, nav').forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
            }
        } catch (error) {
            console.error('Error in welcome animation:', error);
        }
    }
    
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Animate modal appearance
        gsap.fromTo(modal.querySelector('.cyber-card'), 
            { opacity: 0, scale: 0.8 }, 
            { opacity: 1, scale: 1, duration: 0.3 }
        );
    }
    
    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        gsap.to(modal.querySelector('.cyber-card'), {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            onComplete: () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
    }
    
    showSignupModal() {
        const modal = document.getElementById('signup-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Animate modal appearance
        gsap.fromTo(modal.querySelector('.cyber-card'), 
            { opacity: 0, scale: 0.8 }, 
            { opacity: 1, scale: 1, duration: 0.3 }
        );
    }
    
    hideSignupModal() {
        const modal = document.getElementById('signup-modal');
        gsap.to(modal.querySelector('.cyber-card'), {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            onComplete: () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
    }
    
    hideAllModals() {
        this.hideLoginModal();
        this.hideSignupModal();
    }
    
    selectRole(card) {
        // Remove previous selection
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        
        // Select current card
        card.classList.add('selected');
        this.selectedRole = card.dataset.role;
        document.getElementById('signup-role').value = this.selectedRole;
        
        // Animate selection
        gsap.to(card, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        this.showLoading();
        
        try {
            const response = await fetch('api/auth.php/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.data.user;
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                
                this.showSuccessMessage('Login successful! Redirecting...');
                
                setTimeout(() => {
                    this.redirectToDashboard(this.currentUser.role);
                }, 1500);
            } else {
                this.showErrorMessage(data.message);
            }
        } catch (error) {
            this.showErrorMessage('Login failed. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
    
    async handleSignup(e) {
        e.preventDefault();
        
        if (!this.selectedRole) {
            this.showErrorMessage('Please select your role');
            return;
        }
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const vrEnabled = document.getElementById('vr-enabled').checked;
        
        if (password !== confirmPassword) {
            this.showErrorMessage('Passwords do not match');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch('api/auth.php/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: this.selectedRole,
                    vr_enabled: vrEnabled
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccessMessage('Account created successfully! You can now login.');
                setTimeout(() => {
                    this.hideSignupModal();
                    this.showLoginModal();
                }, 2000);
            } else {
                this.showErrorMessage(data.message);
            }
        } catch (error) {
            this.showErrorMessage('Registration failed. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
    
    redirectToDashboard(role) {
        switch (role) {
            case 'admin':
                window.location.href = 'admin.html';
                break;
            case 'teacher':
                window.location.href = 'teacher.html';
                break;
            case 'student':
                window.location.href = 'student.html';
                break;
            default:
                window.location.href = 'dashboard.html';
        }
    }
    
    showLoading() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading-screen').classList.add('hidden');
    }
    
    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showToast(message, 'error');
    }
    
    showDemoModal() {
        alert('Demo video would be shown here. For now, you can use the demo accounts to explore the system!');
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg max-w-sm transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`;
        
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-1">
                    <p class="text-white font-medium">${message}</p>
                </div>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    &times;
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        gsap.fromTo(toast, 
            { opacity: 0, x: 100 }, 
            { opacity: 1, x: 0, duration: 0.3 }
        );
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            gsap.to(toast, {
                opacity: 0,
                x: 100,
                duration: 0.3,
                onComplete: () => toast.remove()
            });
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPageManager();
});
