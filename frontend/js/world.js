import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class World {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.FogExp2(0x050510, 0.035);

        // Camera
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 3, 6);
        this.camera.lookAt(0, 1.5, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Clock
        this.clock = new THREE.Clock();

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 2, 0);

        // Lights
        this.addLights();

        // Floor
        this.addFloor();

        // Particles
        this.addParticles();

        // Resize Listener
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0x222244, 0.2); // Darker ambient
        this.scene.add(ambientLight);

        // Key Light (Warm/White)
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048; // High res shadow
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Cyber-Blue Rim Light (Left)
        const blueLight = new THREE.PointLight(0x00ffff, 1.5, 20);
        blueLight.position.set(-5, 5, 5);
        this.scene.add(blueLight);

        // Cyber-Pink Rim Light (Right)
        const pinkLight = new THREE.PointLight(0xff00ff, 1.5, 20);
        pinkLight.position.set(5, 5, -5);
        this.scene.add(pinkLight);
    }

    addFloor() {
        // Infinite-looking Plane
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({
            color: 0x050510,
            roughness: 0.1, // Highly reflective
            metalness: 0.8  // Metallic
        });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Neon Grid
        const grid = new THREE.GridHelper(100, 50, 0x00ffff, 0x220044);
        grid.position.y = 0.01; // Slightly above floor to avoid Z-fighting
        this.scene.add(grid);
    }

    addParticles() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 500; i++) {
            vertices.push(
                (Math.random() - 0.5) * 40,
                Math.random() * 10,
                (Math.random() - 0.5) * 40
            );
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.controls.update();

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
