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
        let emissive = 0x000000;

        if (style === 'angry') { color = 0xff0000; emissive = 0x550000; }
        if (style === 'happy') { color = 0xffff00; emissive = 0x555500; }
        if (style === 'sad') { color = 0x0000ff; emissive = 0x000055; }
        if (style === 'excited') { color = 0xff00ff; emissive = 0x550055; }

        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: emissive,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1.0
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Random starting position around the character
        mesh.position.set(
            (Math.random() - 0.5) * 5,
            2,
            (Math.random() - 0.5) * 2 + 2
        );

        // Add initial scale for bounce effect
        mesh.scale.set(0, 0, 0);

        this.scene.add(mesh);
        this.floatingTexts.push({
            mesh,
            life: 5.0,
            maxLife: 5.0,
            velocity: new THREE.Vector3(0, 0.5, 0)
        });
    }

    update(delta) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const item = this.floatingTexts[i];
            item.life -= delta;
            const age = item.maxLife - item.life;

            // Float up with wobble
            item.mesh.position.y += delta * 0.5;
            item.mesh.rotation.y += delta * 0.5;
            item.mesh.position.x += Math.sin(age * 2) * delta * 0.5;

            // Bounce In Effect (Scale 0 -> 1 with overshoot)
            if (age < 0.5) {
                const t = age / 0.5;
                const scale = Math.sin(t * Math.PI * 0.7) * 1.2; // Overshoot
                item.mesh.scale.setScalar(scale);
            } else if (age < 0.7) {
                 // Settle down to 1
                const t = (age - 0.5) / 0.2;
                const scale = 1.2 - (t * 0.2);
                item.mesh.scale.setScalar(scale);
            }

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
