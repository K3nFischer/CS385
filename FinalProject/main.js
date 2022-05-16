import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import FirstPersonCamera from './FirstPersonControls.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js';

async function loadModels() {
    const loader = new GLTFLoader();
    let gun = null;
    loader.load('./Models/thompson_submachine_gun/scene.gltf', function( gltf ) {
        gun = gltf.scene;
    }, undefined, function ( error ) {

        console.error( error );

    } )
    return gun;
}

class FirstPersonCameraDemo {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.initializeRenderer();
        this.initializeLights();
        this.initializeScene();
        this.initializePostFX();
        this.initializeDemo();

        this.previousRAF = null;
        this.raf();
        this.onWindowResize();
    }

    initializeDemo() {
        this.fpsCamera = new FirstPersonCamera(this.camera, this.objects);
    }

    initializeRenderer() {
        this.threejs = new THREE.WebGLRenderer();
        this.threejs.shadowMap.enabled = true;
        this.threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this.threejs.setPixelRatio(window.devicePixelRatio);
        this.threejs.setSize(window.innerWidth, window.innerHeight);
        this.threejs.physicallyCorrectLights = true;
        this.threejs.outputEncoding = THREE.sRGBEncoding;

        document.body.appendChild(this.threejs.domElement);

        window.addEventListener('resize', () => {
            this.onWindowResize();
        }, false);

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 2, 0);

        this.scene = new THREE.Scene();

        this.uiCamera = new THREE.OrthographicCamera(
            -1, 1, 1 * aspect, -1 * aspect, 1, 1000);
        this.uiScene = new THREE.Scene();
    }

    initializeScene() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './Textures/clouds/clouds1_east.bmp',
            './Textures/clouds/clouds1_west.bmp',
            './Textures/clouds/clouds1_up.bmp',
            './Textures/clouds/clouds1_down.bmp',
            './Textures/clouds/clouds1_north.bmp',
            './Textures/clouds/clouds1_south.bmp',
        ]);

        texture.encoding = THREE.sRGBEncoding;
        this.scene.background = texture;

        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.threejs.capabilities.getMaxAnisotropy();
        const checkerboard = mapLoader.load('Textures/checkerboard.png');
        checkerboard.anisotropy = maxAnisotropy;
        checkerboard.wrapS = THREE.RepeatWrapping;
        checkerboard.wrapT = THREE.RepeatWrapping;
        checkerboard.repeat.set(32, 32);
        checkerboard.encoding = THREE.sRGBEncoding;

        const floorMaterial = this.loadMaterial('hardwood-brown-planks-', 8);

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({map: checkerboard}));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 4),
            this.loadMaterial('vintage-tile1_', 0.2));
        box.position.set(10, 2, 0);
        box.castShadow = true;
        box.receiveShadow = true;
        this.scene.add(box);

        const concreteMaterial = this.loadMaterial('concrete3-', 4);

        const wall1 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            floorMaterial);
        wall1.position.set(0, -40, -50);
        wall1.castShadow = true;
        wall1.receiveShadow = true;
        this.scene.add(wall1);

        const wall2 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            floorMaterial);
        wall2.position.set(0, -40, 50);
        wall2.castShadow = true;
        wall2.receiveShadow = true;
        this.scene.add(wall2);

        const wall3 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            floorMaterial);
        wall3.position.set(50, -40, 0);
        wall3.castShadow = true;
        wall3.receiveShadow = true;
        this.scene.add(wall3);

        const wall4 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            floorMaterial);
        wall4.position.set(-50, -40, 0);
        wall4.castShadow = true;
        wall4.receiveShadow = true;
        this.scene.add(wall4);

        // Create Box3 for each mesh in the scene so that we can
        // do some easy intersection tests.
        const meshes = [
            plane, box, wall1, wall2, wall3, wall4];

        this.objects = [];

        for (let i = 0; i < meshes.length; ++i) {
            const b = new THREE.Box3();
            b.setFromObject(meshes[i]);
            this.objects.push(b);
        }

        // Crosshair
        const crosshair = mapLoader.load('Textures/customcrosshair.png');
        crosshair.anisotropy = maxAnisotropy;

        this.sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({map: crosshair, color: 0xffffff, fog: false, depthTest: false, depthWrite: false}));
        this.sprite.scale.set(0.08, 0.08 * this.camera.aspect, 1)
        this.sprite.position.set(0, 0, -10);

        this.uiScene.add(this.sprite);
    }

    initializeLights() {
        let light = new THREE.DirectionalLight(
            0xFFFFFF, 1);
        light.position.set(20,50, 0);
        light.castShadow = true;
        light.shadow.bias = -0.00001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 100;

        light.position.set(25, 25, 0);
        light.lookAt(0, 0, 0);
        this.scene.add(light);

        const upColour = 0xFFFF80;
        const downColour = 0x808080;
        light = new THREE.HemisphereLight(upColour, downColour, 0.5);
        light.color.setHSL( 0.6, 1, 0.6 );
        light.groundColor.setHSL( 0.095, 1, 0.75 );
        light.position.set(0, 4, 0);
        this.scene.add(light);
    }

    loadMaterial(name, tiling) {
        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.threejs.capabilities.getMaxAnisotropy();

        const metalMap = mapLoader.load('Textures/freepbr/' + name + 'metallic.png');
        metalMap.anisotropy = maxAnisotropy;
        metalMap.wrapS = THREE.RepeatWrapping;
        metalMap.wrapT = THREE.RepeatWrapping;
        metalMap.repeat.set(tiling, tiling);

        const albedo = mapLoader.load('Textures/freepbr/' + name + 'albedo.png');
        albedo.anisotropy = maxAnisotropy;
        albedo.wrapS = THREE.RepeatWrapping;
        albedo.wrapT = THREE.RepeatWrapping;
        albedo.repeat.set(tiling, tiling);
        albedo.encoding = THREE.sRGBEncoding;

        const normalMap = mapLoader.load('Textures/freepbr/' + name + 'normal.png');
        normalMap.anisotropy = maxAnisotropy;
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(tiling, tiling);

        const roughnessMap = mapLoader.load('Textures/freepbr/' + name + 'roughness.png');
        roughnessMap.anisotropy = maxAnisotropy;
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(tiling, tiling);

        const material = new THREE.MeshStandardMaterial({
            metalnessMap: metalMap,
            map: albedo,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
        });

        return material;
    }

    initializePostFX() {
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.uiCamera.left = -this.camera.aspect;
        this.uiCamera.right = this.camera.aspect;
        this.uiCamera.updateProjectionMatrix();

        this.threejs.setSize(window.innerWidth, window.innerHeight);
    }

    raf() {
        requestAnimationFrame((t) => {
            if (this.previousRAF === null) {
                this.previousRAF = t;
            }
            this.step(t - this.previousRAF);
            this.threejs.autoClear = true;
            this.threejs.render(this.scene, this.camera);
            this.threejs.autoClear = false;
            this.threejs.render(this.uiScene, this.uiCamera);
            this.previousRAF = t;
            this.raf();
        });
    }

    step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        this.fpsCamera.update(timeElapsedS);
    }
}

let APP = null;

window.addEventListener('DOMContentLoaded', () => {
    APP = new FirstPersonCameraDemo();
});