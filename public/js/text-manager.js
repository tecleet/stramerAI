import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export class TextManager {
    constructor(scene) {
        this.scene = scene;
        this.font = null;
        this.activeTexts = [];
        this.loadFont();
    }

    loadFont() {
        const loader = new FontLoader();
        // Load font from node_modules directly
        loader.load('/node_modules/three/examples/fonts/helvetiker_regular.typeface.json', (response) => {
            this.font = response;
            console.log('Font loaded');
        }, undefined, (err) => {
            console.error('Error loading font:', err);
        });
    }

    createFloatingText(message, author) {
        if (!this.font) return;

        const geometry = new TextGeometry(`${author}: ${message}`, {
            font: this.font,
            size: 0.5,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5
        });

        geometry.computeBoundingBox();
        const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(centerOffset, 0, 0);

        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(0, 3, 0); // Start above character
        this.scene.add(mesh);

        this.activeTexts.push({
            mesh: mesh,
            createdAt: Date.now(),
            lifetime: 5000 // 5 seconds
        });
    }

    update(delta) {
        const now = Date.now();
        for (let i = this.activeTexts.length - 1; i >= 0; i--) {
            const textObj = this.activeTexts[i];
            const age = now - textObj.createdAt;

            // Float up
            textObj.mesh.position.y += delta * 0.5;
            // Fade out logic? (Requires transparent material)

            if (age > textObj.lifetime) {
                this.scene.remove(textObj.mesh);
                textObj.mesh.geometry.dispose();
                textObj.mesh.material.dispose();
                this.activeTexts.splice(i, 1);
            }
        }
    }
}
