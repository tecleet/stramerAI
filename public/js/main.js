import { initScene } from './scene.js';
import { Character } from './character.js';
import { TextManager } from './text-manager.js';
import { initSocket } from './socket.js';
import * as THREE from 'three';

let scene, camera, renderer;
let character;
let textManager;
let clock;

init();

function init() {
    // Scene setup
    const sceneData = initScene();
    scene = sceneData.scene;
    camera = sceneData.camera;
    renderer = sceneData.renderer;

    clock = new THREE.Clock();

    // Character
    character = new Character(scene);

    // Text Manager
    textManager = new TextManager(scene);

    // Socket
    initSocket(character, textManager);

    // Animation Loop
    renderer.setAnimationLoop(animate);
}

function animate() {
    const delta = clock.getDelta();

    if (character) character.update(delta);
    if (textManager) textManager.update(delta);

    renderer.render(scene, camera);
}
