import * as THREE from 'three';

export class Character {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.isTalking = false;
        this.talkTimer = 0;

        // Animation State
        this.currentAnimation = null;
        this.animationTimer = 0;
        this.animationTotalDuration = 0;

        // Body Parts Ref
        this.headGroup = null;
        this.torso = null;
        this.leftArm = null;
        this.rightArm = null;

        this.createBody();
        this.scene.add(this.group);
    }

    createBody() {
        const material = new THREE.MeshStandardMaterial({ color: 0x3366cc, roughness: 0.3 });
        const jointMat = new THREE.MeshStandardMaterial({ color: 0x222 });

        // Torso
        this.torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.6), material);
        this.torso.position.y = 2.25;
        this.group.add(this.torso);

        // Head Group
        this.headGroup = new THREE.Group();
        this.headGroup.position.set(0, 3.1, 0);

        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), material);
        this.headGroup.add(headMesh);

        // Eyes
        const eyeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.2, 0.1, 0.41);
        this.headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.2, 0.1, 0.41);
        this.headGroup.add(rightEye);

        // Mouth (for eating animation)
        const mouthGeo = new THREE.BoxGeometry(0.4, 0.05, 0.05);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.mouth = new THREE.Mesh(mouthGeo, mouthMat);
        this.mouth.position.set(0, -0.2, 0.41);
        this.headGroup.add(this.mouth);

        this.group.add(this.headGroup);

        // Limbs Helper
        const createLimb = (x, y, isLeg) => {
            const group = new THREE.Group();
            group.position.set(x, y, 0);

            const joint = new THREE.Mesh(new THREE.SphereGeometry(0.2), jointMat);
            group.add(joint);

            const limb = new THREE.Mesh(new THREE.BoxGeometry(0.3, isLeg ? 1.5 : 1.2, 0.3), material);
            limb.position.y = isLeg ? -0.75 : -0.6;
            group.add(limb);

            this.group.add(group);
            return group;
        };

        this.leftArm = createLimb(-0.8, 2.8, false);
        this.rightArm = createLimb(0.8, 2.8, false);
        this.leftLeg = createLimb(-0.3, 1.5, true);
        this.rightLeg = createLimb(0.3, 1.5, true);
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

    // New method for "eating" text
    eatAnimation(progress) {
        // Open mouth wider
        const mouthOpen = Math.sin(progress * Math.PI * 4) * 0.2 + 0.2;
        this.mouth.scale.y = mouthOpen * 5;

        // Lean forward
        this.torso.rotation.x = Math.sin(progress * Math.PI) * 0.2;
        this.headGroup.rotation.x = Math.sin(progress * Math.PI) * 0.1;

        // Chomping motion
        if (progress > 0.4 && progress < 0.6) {
             this.headGroup.position.z = 0.5; // lunging forward
        } else {
             this.headGroup.position.z = 0;
        }
    }

    update(delta) {
        // Idle Float
        this.group.position.y = Math.sin(Date.now() * 0.001) * 0.1;

        if (this.isTalking) {
            this.talkTimer -= delta;
            // Mouth flap
            this.mouth.scale.y = 1 + Math.sin(Date.now() * 0.02) * 2;
            if (this.talkTimer <= 0) {
                this.isTalking = false;
                this.mouth.scale.y = 1;
            }
        }

        if (this.currentAnimation) {
            this.animationTimer -= delta;
            if (this.animationTimer < 0) this.animationTimer = 0; // clamp

            const progress = 1 - (this.animationTimer / this.animationTotalDuration);

            if (this.currentAnimation === 'jump') {
                this.group.position.y = Math.sin(progress * Math.PI) * 2;
            } else if (this.currentAnimation === 'wave') {
                this.rightArm.rotation.z = Math.PI - Math.sin(progress * Math.PI * 4);
            } else if (this.currentAnimation === 'dance') {
                this.group.rotation.y = Math.sin(progress * Math.PI * 4);
                this.leftArm.rotation.z = Math.sin(progress * Math.PI * 8);
                this.rightArm.rotation.z = -Math.sin(progress * Math.PI * 8);
            } else if (this.currentAnimation === 'eat') {
                this.eatAnimation(progress);
            }

            if (this.animationTimer <= 0) {
                this.currentAnimation = null;
                // Reset Pose
                this.group.rotation.set(0, 0, 0);
                this.rightArm.rotation.set(0, 0, 0);
                this.leftArm.rotation.set(0, 0, 0);
                this.headGroup.position.z = 0;
                this.mouth.scale.y = 1;
            }
        }
    }
}
