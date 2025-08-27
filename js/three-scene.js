/**
 * 3D Scene Manager for the Quiz System
 * Handles Three.js 3D environment, animations, and rendering
 */

class ThreeScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationId = null;
        this.objects = [];
        this.particles = [];
        this.isInitialized = false;
        
        // Scene settings
        this.settings = {
            enableParticles: true,
            enablePostProcessing: true,
            enableVR: false,
            enableAntiCheat3D: true
        };
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createEnvironment();
        this.createParticleSystem();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        
        this.isInitialized = true;
        console.log('3D Scene initialized successfully');
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 1000);
        
        // Set background to gradient
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        
        const gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f0f');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        const canvas = document.getElementById('three-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0x4080ff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Accent lights
        const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 50);
        pointLight1.position.set(-10, 5, -10);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff0088, 0.5, 50);
        pointLight2.position.set(10, 5, -10);
        this.scene.add(pointLight2);
        
        // Spotlight for dramatic effect
        const spotLight = new THREE.SpotLight(0x80ffff, 1, 100, Math.PI / 8, 0.1);
        spotLight.position.set(0, 30, 0);
        spotLight.target.position.set(0, 0, 0);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }
    
    createEnvironment() {
        // Create floating platforms
        this.createFloatingPlatforms();
        
        // Create holographic elements
        this.createHolographicElements();
        
        // Create quiz podium
        this.createQuizPodium();
        
        // Create cyberpunk grid floor
        this.createGridFloor();
        
        // Create floating geometric shapes
        this.createFloatingShapes();
    }
    
    createFloatingPlatforms() {
        const platformGeometry = new THREE.CylinderGeometry(3, 3, 0.2, 16);
        const platformMaterial = new THREE.MeshPhongMaterial({
            color: 0x2080ff,
            transparent: true,
            opacity: 0.8,
            emissive: 0x001122
        });
        
        for (let i = 0; i < 5; i++) {
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.set(
                (Math.random() - 0.5) * 40,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 40
            );
            platform.receiveShadow = true;
            platform.userData = { type: 'platform', floatSpeed: Math.random() * 0.02 + 0.01 };
            this.scene.add(platform);
            this.objects.push(platform);
        }
    }
    
    createHolographicElements() {
        // Create holographic rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(2 + i, 0.1, 8, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(0, 5 + i * 2, 0);
            ring.userData = { 
                type: 'hologram', 
                rotationSpeed: (i + 1) * 0.01,
                originalY: 5 + i * 2
            };
            this.scene.add(ring);
            this.objects.push(ring);
        }
        
        // Create data streams
        this.createDataStreams();
    }
    
    createDataStreams() {
        const streamGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
        const streamMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 20; i++) {
            const stream = new THREE.Mesh(streamGeometry, streamMaterial);
            stream.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 20,
                (Math.random() - 0.5) * 20
            );
            stream.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            stream.userData = { 
                type: 'dataStream',
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * 0.05 + 0.02,
                    (Math.random() - 0.5) * 0.1
                )
            };
            this.scene.add(stream);
            this.objects.push(stream);
        }
    }
    
    createQuizPodium() {
        // Main podium
        const podiumGeometry = new THREE.CylinderGeometry(2, 2.5, 1, 8);
        const podiumMaterial = new THREE.MeshPhongMaterial({
            color: 0x333366,
            emissive: 0x001133
        });
        
        const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
        podium.position.set(0, 0.5, 0);
        podium.castShadow = true;
        podium.receiveShadow = true;
        this.scene.add(podium);
        
        // Holographic screen
        const screenGeometry = new THREE.PlaneGeometry(3, 2);
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 2, 0);
        screen.userData = { type: 'quizScreen' };
        this.scene.add(screen);
        this.objects.push(screen);
    }
    
    createGridFloor() {
        const size = 100;
        const divisions = 50;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x0080ff, 0x004080);
        gridHelper.position.y = -2;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
    }
    
    createFloatingShapes() {
        const shapes = [
            new THREE.OctahedronGeometry(0.5),
            new THREE.TetrahedronGeometry(0.7),
            new THREE.IcosahedronGeometry(0.6)
        ];
        
        for (let i = 0; i < 15; i++) {
            const geometry = shapes[Math.floor(Math.random() * shapes.length)];
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
                transparent: true,
                opacity: 0.8,
                emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.1)
            });
            
            const shape = new THREE.Mesh(geometry, material);
            shape.position.set(
                (Math.random() - 0.5) * 50,
                Math.random() * 20 + 5,
                (Math.random() - 0.5) * 50
            );
            shape.userData = { 
                type: 'floatingShape',
                rotationSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                floatAmplitude: Math.random() * 2 + 1,
                floatSpeed: Math.random() * 0.02 + 0.01,
                originalY: shape.position.y
            };
            this.scene.add(shape);
            this.objects.push(shape);
        }
    }
    
    createParticleSystem() {
        if (!this.settings.enableParticles) return;
        
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;
            
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = Math.random() * 2 + 1;
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particleSystem);
    }
    
    setupControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 100;
            this.controls.minDistance = 5;
            this.controls.maxPolarAngle = Math.PI / 2;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
        } else {
            console.warn('OrbitControls not available, using basic camera controls');
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard controls for 3D navigation
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Mouse controls
        this.renderer.domElement.addEventListener('click', (event) => this.handleClick(event));
    }
    
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    handleKeyDown(event) {
        if (!this.settings.enableAntiCheat3D) return;
        
        // Log potential cheating attempts
        const suspiciousKeys = ['F12', 'F11', 'Escape', 'Tab'];
        if (suspiciousKeys.includes(event.key)) {
            this.triggerAntiCheatWarning(`Suspicious key detected: ${event.key}`);
        }
    }
    
    handleKeyUp(event) {
        // Handle key releases
    }
    
    handleClick(event) {
        // Raycasting for 3D object interaction
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.objects);
        if (intersects.length > 0) {
            this.handleObjectInteraction(intersects[0].object);
        }
    }
    
    handleObjectInteraction(object) {
        // Handle interaction with 3D objects
        console.log('Interacted with:', object.userData.type);
        
        // Add visual feedback
        const originalColor = object.material.color.clone();
        object.material.color.setHex(0xffffff);
        
        setTimeout(() => {
            object.material.color.copy(originalColor);
        }, 200);
    }
    
    triggerAntiCheatWarning(message) {
        console.warn('Anti-cheat triggered:', message);
        // This would integrate with the main anti-cheat system
        if (window.antiCheatSystem) {
            window.antiCheatSystem.triggerWarning(message);
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const time = performance.now() * 0.001;
        
        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.material.uniforms.time.value = time;
            this.particleSystem.rotation.y += 0.001;
        }
        
        // Animate objects
        this.objects.forEach(object => {
            const userData = object.userData;
            
            switch (userData.type) {
                case 'platform':
                    object.position.y += Math.sin(time * userData.floatSpeed) * 0.01;
                    object.rotation.y += 0.005;
                    break;
                    
                case 'hologram':
                    object.rotation.y += userData.rotationSpeed;
                    object.position.y = userData.originalY + Math.sin(time * 2) * 0.5;
                    object.material.opacity = 0.6 + Math.sin(time * 3) * 0.2;
                    break;
                    
                case 'dataStream':
                    object.position.add(userData.velocity);
                    object.rotation.x += 0.02;
                    object.rotation.z += 0.015;
                    
                    // Reset position if too far
                    if (object.position.length() > 30) {
                        object.position.set(
                            (Math.random() - 0.5) * 20,
                            Math.random() * 20,
                            (Math.random() - 0.5) * 20
                        );
                    }
                    break;
                    
                case 'floatingShape':
                    object.rotation.x += userData.rotationSpeed.x;
                    object.rotation.y += userData.rotationSpeed.y;
                    object.rotation.z += userData.rotationSpeed.z;
                    object.position.y = userData.originalY + 
                        Math.sin(time * userData.floatSpeed) * userData.floatAmplitude;
                    break;
                    
                case 'quizScreen':
                    object.material.opacity = 0.7 + Math.sin(time * 2) * 0.1;
                    break;
            }
        });
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    // Public methods for external control
    enableVRMode() {
        this.settings.enableVR = true;
        // VR setup would go here
        console.log('VR mode enabled');
    }
    
    disableVRMode() {
        this.settings.enableVR = false;
        console.log('VR mode disabled');
    }
    
    updateQuizScreen(content) {
        const screen = this.objects.find(obj => obj.userData.type === 'quizScreen');
        if (screen) {
            // Update screen content - could be a canvas texture
            console.log('Updating quiz screen with:', content);
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js objects
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('3D Scene destroyed');
    }
}

// Initialize the 3D scene when the page loads
let threeScene;

document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully loaded
    setTimeout(() => {
        threeScene = new ThreeScene();
        window.threeScene = threeScene; // Make it globally accessible
    }, 100);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeScene;
}
