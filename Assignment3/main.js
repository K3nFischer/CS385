//
// main.js
//
angle = 0;

function init() {
    var canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");

    gl.clearColor(0, .5, .5, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK_FACE);

    cube = new Cube(gl);

    requestAnimationFrame(render);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    angle += 1;
    cube.MV = rotate(angle, [1,1,1]);
    cube.P = perspective(45, 1, 1, 10);
    cube.V = lookAt(vec3(0,0,4),vec3(0,0,-1),vec3(0,1,0));

    cube.render();

    requestAnimationFrame(render);
}

window.onload = init;