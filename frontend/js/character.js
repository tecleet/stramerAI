import * as THREE from 'three';

export class Character {
    constructor(scene) {
        this.scene = scene;
        this.isTalking = false;
        this.talkTimer = 0;
        this.currentAnimation = null;
        this.animationTimer = 0;
        this.initialPos = new THREE.Vector3(0, 0, 0);

        // Body parts
        this.group = new THREE.Group();
        this.createBody();
        this.scene.add(this.group);
    }

    createBody() {
        // High-Quality Materials
        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: 0x2266ff,
            roughness: 0.2,
            metalness: 0.8,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const jointMat = new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            roughness: 0.5,
            metalness: 0.5
        });
        const eyeMat = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 2.0
        });

        // Torso
        this.torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.6), bodyMat);
        this.torso.position.y = 2.25;
        this.torso.castShadow = true;
        this.group.add(this.torso);

        // Head
        this.headGroup = new THREE.Group();
        this.head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), bodyMat);
        this.head.castShadow = true;
        this.headGroup.add(this.head);

        // Eyes
        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.1), eyeMat);
        leftEye.position.set(-0.2, 0.1, 0.41);
        this.headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.1), eyeMat);
        rightEye.position.set(0.2, 0.1, 0.41);
        this.headGroup.add(rightEye);

        this.headGroup.position.set(0, 3.1, 0);
        this.group.add(this.headGroup);

        // Arms
        this.leftArm = this.createLimb(bodyMat, jointMat, -0.8, 2.8, 0);
        this.rightArm = this.createLimb(bodyMat, jointMat, 0.8, 2.8, 0);

        // Legs
        this.leftLeg = this.createLimb(bodyMat, jointMat, -0.3, 1.5, 0, true);
        this.rightLeg = this.createLimb(bodyMat, jointMat, 0.3, 1.5, 0, true);
    }

    createLimb(material, jointMat, x, y, z, isLeg = false) {
        const limbGroup = new THREE.Group();
        limbGroup.position.set(x, y, z);

        const joint = new THREE.Mesh(new THREE.SphereGeometry(0.2), jointMat);
        limbGroup.add(joint);

        const limb = new THREE.Mesh(new THREE.BoxGeometry(0.3, isLeg ? 1.5 : 1.2, 0.3), material);
        limb.position.y = isLeg ? -0.75 : -0.6;
        limb.castShadow = true;
        limbGroup.add(limb);

        this.group.add(limbGroup);
        return limbGroup;
    }

    playAnimation(name, duration = 2000) {
        console.log(`Character Animation: ${name}`);
        this.currentAnimation = name;
        this.animationTimer = duration / 1000;
        this.animationTotalDuration = duration / 1000;
    }

    startTalking(duration) {
        this.isTalking = true;
        this.talkTimer = duration / 1000;
    }

    update(delta) {
        const time = Date.now() * 0.001;

        // Idle Animation (breathing + floating)
        this.torso.position.y = 2.25 + Math.sin(time * 2) * 0.05;
        this.headGroup.position.y = 3.1 + Math.sin(time * 2) * 0.05;

        // Random idle head movement
        this.headGroup.rotation.y = Math.sin(time * 0.5) * 0.2;

        // Talking Animation (Head bobbing)
        if (this.isTalking) {
            this.headGroup.rotation.x = Math.sin(time * 20) * 0.1;
            this.talkTimer -= delta;
            if (this.talkTimer <= 0) {
                this.isTalking = false;
                this.headGroup.rotation.x = 0;
            }
        }

        // Action Animations
        if (this.currentAnimation) {
            this.animationTimer -= delta;
            const progress = 1 - (this.animationTimer / this.animationTotalDuration);

            if (this.currentAnimation === 'jump') {
                // Parabolic jump with squash/stretch
                const jumpHeight = 3;
                const jumpProgress = Math.sin(progress * Math.PI);
                this.group.position.y = jumpProgress * jumpHeight;

                // Stretch when jumping, Squash when landing
                if (jumpProgress > 0.1) {
                    this.group.scale.set(0.8, 1.2, 0.8); // Stretch
                } else {
                    this.group.scale.set(1.2, 0.8, 1.2); // Squash
                }
            } else if (this.currentAnimation === 'wave') {
                // Energetic Wave
                this.rightArm.rotation.z = Math.PI - 0.5; // Lift arm
                this.rightArm.rotation.x = Math.sin(progress * Math.PI * 8) * 0.5; // Wave hand
            } else if (this.currentAnimation === 'dance') {
                // Funky Dance
                this.group.position.y = Math.abs(Math.sin(time * 10)) * 0.5; // Bouncing
                this.leftArm.rotation.z = Math.sin(time * 10) * 2;
                this.rightArm.rotation.z = Math.cos(time * 10) * 2;
                this.group.rotation.y = Math.sin(time * 2) * 0.5; // Body twist
            }

            if (this.animationTimer <= 0) {
                this.currentAnimation = null;
                // Reset Pose
                this.group.position.y = 0;
                this.group.scale.set(1, 1, 1);
                this.rightArm.rotation.z = 0;
                this.rightArm.rotation.x = 0;
                this.leftArm.rotation.z = 0;
                this.group.rotation.y = 0;
            }
        } else {
            // Default arm swing
            this.leftArm.rotation.x = Math.sin(time * 2) * 0.1;
            this.rightArm.rotation.x = -Math.sin(time * 2) * 0.1;
        }
    }
}
