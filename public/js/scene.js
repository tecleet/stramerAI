import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;

export function initScene() {
    const container = document.getElementById('canvas-container');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // Dark grey background
    // For transparent background (obs chroma key not needed if using browser source with alpha):
    // scene.background = null;
    // renderer.setClearColor( 0x000000, 0 );

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Ground (optional, maybe invisible catcher)
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Controls (for debugging/positioning)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Handle resize
    window.addEventListener('resize', onWindowResize);

    return { scene, camera, renderer };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export function render() {
    controls.update();
    renderer.render(scene, camera);
}
