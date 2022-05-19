import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import FirstPersonCamera from './FirstPersonControls.js';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js';

let fpsCamera, threejs, camera, scene, uiCamera, uiScene, objects, clock, gun;

function init() {
    initializeRenderer();
    initializeLights();
    initializeScene();
    initializeFPSCamera();
    clock = new THREE.Clock();
    raf();
    onWindowResize();
}

function initializeFPSCamera() {
    fpsCamera = new FirstPersonCamera(camera, objects);
}

function initializeRenderer() {
    threejs = new THREE.WebGLRenderer();
    threejs.shadowMap.enabled = true;
    threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    threejs.setPixelRatio(window.devicePixelRatio);
    threejs.setSize(window.innerWidth, window.innerHeight);
    threejs.physicallyCorrectLights = true;
    threejs.outputEncoding = THREE.sRGBEncoding;

    document.body.appendChild(threejs.domElement);

    window.addEventListener('resize', () => {
        onWindowResize();
    }, false);

    document.onclick = function() {
        document.body.requestPointerLock();
    }

    const fov = 90;
    const aspect = 1920 / 1080;
    const near = .1;
    const far = 1000.0;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2, 0);

    scene = new THREE.Scene();
    scene.add(camera)

    uiCamera = new THREE.OrthographicCamera(
        -1, 1, 1 * aspect, -1 * aspect, 1, 1000);
    uiScene = new THREE.Scene();
}

function initializeScene() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./Models/thompson_submachine_gun/scene.gltf', function( gltf ) {
        gun = gltf.scene;
        gun.position.set(.5, -.5, -.8);
        gun.rotation.y = Math.PI /2;
        camera.add(gun);
    }, undefined, function ( error ) {
        console.error( error );
    } );

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
    scene.background = texture;

    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = threejs.capabilities.getMaxAnisotropy();

    const floorMaterial = loadMaterial('hardwood-brown-planks-', 8);
    const brickMaterial = loadMaterial('dirty-red-bricks_', 12);
    const boxMaterial = loadMaterial('woodframe1-', 1);

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 20, 20),
        floorMaterial);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        boxMaterial);
    box.position.set(10, 1, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    const box2 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        boxMaterial);
    box2.position.set(3, 1, 12);
    box2.castShadow = true;
    box2.receiveShadow = true;
    scene.add(box2);

    const box3 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        boxMaterial);
    box3.position.set(-8, 1, 0);
    box3.castShadow = true;
    box3.receiveShadow = true;
    scene.add(box3);

    const box4 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        boxMaterial);
    box4.position.set(0, 1, -5);
    box4.castShadow = true;
    box4.receiveShadow = true;
    scene.add(box4);

    const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry(100, 100, 4),
        brickMaterial);
    wall1.position.set(0, -40, -50);
    wall1.castShadow = true;
    wall1.receiveShadow = true;
    scene.add(wall1);

    const wall2 = new THREE.Mesh(
        new THREE.BoxGeometry(100, 100, 4),
        brickMaterial);
    wall2.position.set(0, -40, 50);
    wall2.castShadow = true;
    wall2.receiveShadow = true;
    scene.add(wall2);

    const wall3 = new THREE.Mesh(
        new THREE.BoxGeometry(4, 100, 100),
        brickMaterial);
    wall3.position.set(50, -40, 0);
    wall3.castShadow = true;
    wall3.receiveShadow = true;
    scene.add(wall3);

    const wall4 = new THREE.Mesh(
        new THREE.BoxGeometry(4, 100, 100),
        brickMaterial);
    wall4.position.set(-50, -40, 0);
    wall4.castShadow = true;
    wall4.receiveShadow = true;
    scene.add(wall4);

    // Create Box3 for each mesh in the scene so that we can
    // do some easy intersection tests.
    const meshes = [
        plane, box, box2, box3, box4, wall1, wall2, wall3, wall4];

    objects = [];

    for (let i = 0; i < meshes.length; ++i) {
        const b = new THREE.Box3();
        b.setFromObject(meshes[i]);
        objects.push(b);
    }

    // Crosshair
    const crosshair = mapLoader.load('Textures/customcrosshair.png');
    crosshair.anisotropy = maxAnisotropy;

    let sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({map: crosshair, color: 0xffffff, fog: false, depthTest: false, depthWrite: false}));
    sprite.scale.set(0.08, 0.08 * camera.aspect, 1)
    sprite.position.set(0, 0, -10);

    uiScene.add(sprite);
}

function initializeLights() {
    let light = new THREE.DirectionalLight(
        0xFFFFFF, 1);
    light.castShadow = true;
    light.shadow.bias = -0.00001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = -500;
    light.shadow.camera.bottom = -500;
    light.shadow.camera.right = 500;
    light.shadow.camera.top = 500;

    light.position.set(150, 50, 45);
    scene.add(light);


    const upColour = 0xFFBB69;
    const downColour = 0x5E5E5E;
    let lightHemisphere = new THREE.HemisphereLight(upColour, downColour, 1);
    scene.add(lightHemisphere);
}

function loadMaterial(name, tiling) {
    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = threejs.capabilities.getMaxAnisotropy();

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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    uiCamera.left = -camera.aspect;
    uiCamera.right = camera.aspect;
    uiCamera.updateProjectionMatrix();

    threejs.setSize(window.innerWidth, window.innerHeight);
}

function raf() {
    fpsCamera.update(clock.getDelta());
    threejs.autoClear = true;
    threejs.render(scene, camera);
    threejs.autoClear = false;
    threejs.render(uiScene, uiCamera);

    requestAnimationFrame(raf);
}

window.onload = init;