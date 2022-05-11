let scene, camera, renderer, loader;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    loader = new THREE.GLTFLoader();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    loader.load( 'Models/thompson_submachine_gun/scene.gltf', function ( gltf ) {
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    });


    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    camera.position.z = 5;

    animate();
}

function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

window.onload = init;