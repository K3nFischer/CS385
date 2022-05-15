import * as THREE from './node_modules/three/src/Three.js';

const KEYS = {
    'a': 65,
    's': 83,
    'w': 87,
    'd': 68,
};

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}

class InputController {
    constructor(target) {
        this.target = target || document;
        this.initialize();
    }

    initialize() {
        this.current = {
            leftButton: false,
            rightButton: false,
            mouseXDelta: 0,
            mouseYDelta: 0,
            mouseX: 0,
            mouseY: 0,
        };
        this.previous = null;
        this.keys = {};
        this.previousKeys = {};
        this.target.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        this.target.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        this.target.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
        this.target.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        this.target.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onMouseMove(e) {
        this.current.mouseX = e.pageX - window.innerWidth / 2;
        this.current.mouseY = e.pageY - window.innerHeight / 2;

        if (this.previous === null) {
            this.previous = {...this.current};
        }

        this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX;
        this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY;
    }

    onMouseDown(e) {
        this.onMouseMove(e);

        switch (e.button) {
            case 0: {
                this.current.leftButton = true;
                break;
            }
            case 2: {
                this.current.rightButton = true;
                break;
            }
        }
    }

    onMouseUp(e) {
        this.onMouseMove(e);

        switch (e.button) {
            case 0: {
                this.current.leftButton = false;
                break;
            }
            case 2: {
                this.current.rightButton = false;
                break;
            }
        }
    }

    onKeyDown(e) {
        this.keys[e.keyCode] = true;
    }

    onKeyUp(e) {
        this.keys[e.keyCode] = false;
    }

    key(keyCode) {
        return !!this.keys[keyCode];
    }

    isReady() {
        return this.previous !== null;
    }

    update(_) {
        if (this.previous !== null) {
            this.current.mouseXDelta = this.current.mouseX - this.previous.mouseX;
            this.current.mouseYDelta = this.current.mouseY - this.previous.mouseY;

            this.previous = {...this.current};
        }
    }
};


class FirstPersonCamera {
    constructor(camera, objects) {
        this.camera = camera;
        this.input = new InputController();
        this.rotation = new THREE.Quaternion();
        this.translation = new THREE.Vector3(0, 2, 0);
        this.phi = 0;
        this.phiSpeed = 8;
        this.theta = 0;
        this.thetaSpeed = 5;
        this.headBobActive = false;
        this.headBobTimer = 0;
        this.objects = objects;
    }

    update(timeElapsedS) {
        this.updateRotation(timeElapsedS);
        this.updateCamera(timeElapsedS);
        this.updateTranslation(timeElapsedS);
        this.updateHeadBob(timeElapsedS);
        this.input.update(timeElapsedS);
    }

    updateCamera(_) {
        this.camera.quaternion.copy(this.rotation);
        this.camera.position.copy(this.translation);
        this.camera.position.y += Math.sin(this.headBobTimer * 10) * .2;

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.rotation);

        const dir = forward.clone();

        forward.multiplyScalar(100);
        forward.add(this.translation);

        let closest = forward;
        const result = new THREE.Vector3();
        const ray = new THREE.Ray(this.translation, dir);
        for (let i = 0; i < this.objects.length; ++i) {
            if (ray.intersectBox(this.objects[i], result)) {
                if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
                    closest = result.clone();
                }
            }
        }

        this.camera.lookAt(closest);
    }

    updateHeadBob(timeElapsedS) {
        if (this.headBobActive) {
            const wavelength = Math.PI;
            const nextStep = 1 + Math.floor(((this.headBobTimer + 0.000001) * 10) / wavelength);
            const nextStepTime = nextStep * wavelength / 10;
            this.headBobTimer = Math.min(this.headBobTimer + timeElapsedS, nextStepTime);

            if (this.headBobTimer == nextStepTime) {
                this.headBobActive = false;
            }
        }
    }

    updateTranslation(timeElapsedS) {
        const forwardVelocity = (this.input.key(KEYS.w) ? 1 : 0) + (this.input.key(KEYS.s) ? -1 : 0)
        const strafeVelocity = (this.input.key(KEYS.a) ? 1 : 0) + (this.input.key(KEYS.d) ? -1 : 0)

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);

        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity * timeElapsedS * 10);

        this.translation.add(forward);
        this.translation.add(left);

        if (forwardVelocity != 0 || strafeVelocity != 0) {
            this.headBobActive = true;
        }
    }

    updateRotation(timeElapsedS) {
        const xh = this.input.current.mouseXDelta / window.innerWidth;
        const yh = this.input.current.mouseYDelta / window.innerHeight;

        this.phi += -xh * this.phiSpeed;
        this.theta = clamp(this.theta + -yh * this.thetaSpeed, -Math.PI / 3, Math.PI / 3);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation.copy(q);
    }
}

export default FirstPersonCamera;