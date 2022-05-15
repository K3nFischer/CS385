let scene, camera, renderer, loader;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    loader = new THREE.GLTFLoader();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    loader.load('Models/thompson_submachine_gun/scene.gltf', function (gltf) {
        gltf.scene.traverse(child => {
            if (child.material) child.material.metalness = 0;
        });
        gltf.scene.position.set(0,1,0);
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    });

    const textureLoader = new THREE.CubeTextureLoader();
    const texture = textureLoader.load([
        './Textures/clouds/clouds1_east.bmp',
        './Textures/clouds/clouds1_west.bmp',
        './Textures/clouds/clouds1_up.bmp',
        './Textures/clouds/clouds1_down.bmp',
        './Textures/clouds/clouds1_north.bmp',
        './Textures/clouds/clouds1_south.bmp',
    ]);
    scene.background = texture;

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x919191);
    scene.add(ambientLight);

    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(100, 1, 100),
        new THREE.MeshStandardMaterial({color: 0x404040}));
    ground.castShadow = false;
    ground.receiveShadow = true;
    scene.add(ground);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    camera.position.z = 2;

    animate();
}

function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( this.animate );
};




window.onload = init;