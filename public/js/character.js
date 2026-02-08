import * as THREE from 'three';

export class Character {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.init();
    }

    init() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 0.5; // Sit on ground
        this.scene.add(this.mesh);

        // Add eyes
        const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.2, 0.2, 0.51);
        this.mesh.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.2, 0.2, 0.51);
        this.mesh.add(rightEye);
    }

    update(delta) {
        // Handle animations here
        // For now, simple bobbing
        // this.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
    }

    speak(text) {
        // Implement TTS logic or visual speech bubble
        console.log(`Character says: ${text}`);
        this.playAnimation('talk');

        // Basic TTS using browser API
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }

    playAnimation(name) {
        console.log(`Playing animation: ${name}`);
        // Simple procedural animation triggers
        if (name === 'jump') {
            this.mesh.position.y = 2;
            setTimeout(() => { this.mesh.position.y = 0.5; }, 500);
        } else if (name === 'talk') {
            // Wiggle
            this.mesh.rotation.y += 0.5;
            setTimeout(() => { this.mesh.rotation.y -= 0.5; }, 200);
        }
    }
}
