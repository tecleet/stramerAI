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

        // Truncate if too long
        const displayText = `${author}: ${text}`;

        const geometry = new TextGeometry(displayText, {
            font: this.font,
            size: 0.4,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5
        });

        geometry.center();

        let color = 0xffffff;
        let emissive = 0x222222;
        let scaleMax = 1.0;
        let isSticky = false;
        let life = 6.0;

        if (style === 'angry') { color = 0xff3333; emissive = 0x550000; }
        if (style === 'happy') { color = 0xffff33; emissive = 0x555500; }
        if (style === 'sad') { color = 0x3333ff; emissive = 0x000055; }
        if (style === 'excited') { color = 0xff00ff; emissive = 0x550055; scaleMax = 1.2; }

        // Special styles detection
        if (text.includes("SUPER CHAT")) {
            color = 0xffd700; // Gold
            emissive = 0xffaa00;
            scaleMax = 1.5;
        } else if (text.includes("SUBSCRIBED")) {
            color = 0x00ff00;
            emissive = 0x005500;
            scaleMax = 1.3;
            isSticky = true;
            life = 60.0; // Stay for a minute
        }

        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: emissive,
            metalness: 0.5,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Position logic
        let position = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            1.5 + Math.random(),
            (Math.random() - 0.5) * 2 + 2
        );

        if (isSticky) {
             // Position on "wall" behind
             position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 5 + 1,
                -5 // Background wall z-depth
             );
        }

        mesh.position.copy(position);

        // Initial scale 0 for pop-in
        mesh.scale.set(0, 0, 0);

        this.scene.add(mesh);
        this.floatingTexts.push({
            mesh,
            life: life,
            age: 0,
            scaleMax: scaleMax,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.5 + Math.random() * 0.5, 0),
            wobblePhase: Math.random() * Math.PI * 2,
            isSticky: isSticky
        });
    }

    // New method to find closest text for eating
    getClosestText(position) {
        let closest = null;
        let minDist = 3.0; // Interaction range

        this.floatingTexts.forEach(item => {
            if (item.isSticky) return; // Don't eat subscribers on the wall
            const dist = item.mesh.position.distanceTo(position);
            if (dist < minDist) {
                minDist = dist;
                closest = item;
            }
        });
        return closest;
    }

    removeText(item) {
        const index = this.floatingTexts.indexOf(item);
        if (index > -1) {
            this.scene.remove(item.mesh);
            item.mesh.geometry.dispose();
            item.mesh.material.dispose();
            this.floatingTexts.splice(index, 1);
        }
    }

    update(delta) {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const item = this.floatingTexts[i];
            item.life -= delta;
            item.age += delta;

            // 1. Pop-in Animation (Elastic/Overshoot effect)
            if (item.age < 0.5) {
                const t = item.age / 0.5;
                // Elastic ease out
                const scale = item.scaleMax * (Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1);
                item.mesh.scale.setScalar(scale);
            } else if (item.life < 1.0) {
                // Fade out scale
                item.mesh.scale.setScalar(item.scaleMax * item.life);
            } else {
                item.mesh.scale.setScalar(item.scaleMax);
            }

            if (item.isSticky) {
                // Stick to wall behavior (slight hover)
                item.mesh.rotation.x = Math.sin(item.age + item.wobblePhase) * 0.1;
                 item.mesh.rotation.y = Math.sin(item.age * 0.5) * 0.1;
            } else {
                // 2. Physics / Float
                item.mesh.position.add(item.velocity.clone().multiplyScalar(delta));
                // Slow down vertical velocity (drag)
                item.velocity.y *= 0.98;
                // Add slight drift
                item.velocity.x += (Math.sin(item.age + item.wobblePhase) * 0.5) * delta;

                // 3. Wobble Rotation
                item.mesh.rotation.y = Math.sin(item.age * 2 + item.wobblePhase) * 0.2;
                item.mesh.rotation.z = Math.cos(item.age * 1.5 + item.wobblePhase) * 0.1;
            }

            if (item.life <= 0) {
                this.removeText(item);
            }
        }
    }
}
