import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export class Text3DSystem {
    constructor(scene) {
        this.scene = scene;
        this.loader = new FontLoader();
        this.font = null;
        this.floatingTexts = [];

        // Load Font
        this.loader.load('https://unpkg.com/three@0.152.2/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.font = font;
            console.log("Font loaded!");
        });
    }

    createFloatingText(text, author, style) {
        if (!this.font) return;

        const geometry = new TextGeometry(`${author}: ${text}`, {
            font: this.font,
            size: 0.5,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });

        geometry.center();

        let color = 0xffffff;
        if (style === 'angry') color = 0xff0000;
        if (style === 'happy') color = 0xffff00;
        if (style === 'sad') color = 0x0000ff;

        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);

        // Random starting position around the character
        mesh.position.set(
            (Math.random() - 0.5) * 5,
            2,
            (Math.random() - 0.5) * 2 + 2
        );

        this.scene.add(mesh);
        this.floatingTexts.push({ mesh, life: 5.0, velocity: new THREE.Vector3(0, 1, 0) });
    }

    update(delta) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const item = this.floatingTexts[i];
            item.life -= delta;

            // Float up
            item.mesh.position.y += delta * 0.5;
            item.mesh.rotation.y += delta * 0.5;

            // Fade out (using scale for simplicity as materials are tricky with transparency on standard)
            if (item.life < 1.0) {
                item.mesh.scale.setScalar(item.life);
            }

            if (item.life <= 0) {
                this.scene.remove(item.mesh);
                item.mesh.geometry.dispose();
                item.mesh.material.dispose();
                this.floatingTexts.splice(i, 1);
            }
        }
    }
}
