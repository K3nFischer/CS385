//
// main.js
//

function init() {
    var canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");

    gl.clearColor(0, .5, 0, 1);
    cube = new Cube(gl);

    render();

}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    cube.render();
}

window.onload = init;