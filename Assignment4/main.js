var gl;

function init() {
    var canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
   
    // Add your sphere creation and configuration code here
    Sun = new Sphere(36, 36);
    Earth = new Sphere(24, 24);
    Moon = new Sphere(12, 12);

    requestAnimationFrame(render);
}

function render() {

    // Update your motion variables here

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
    // Add your rendering sequence here

    ms = new MatrixStack();
    var v = translate(0.0, 0.0, 0.0, -0.5*(near + far))
    ms.load(V)

    requestAnimationFrame(render);
}

window.onload = init;