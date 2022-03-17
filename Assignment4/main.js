var gl;
var year;
var day;

function init() {
    var canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
   
    // Add your sphere creation and configuration code here
    Sun = new Sphere(36, 36);
    Earth = new Sphere(24, 24);
    Moon = new Sphere(24, 24);

    Sun.color = vec4(1, .7, 0, 1);
    Earth.color = vec4(0, .2, 1, 1);
    Moon.color = vec4(.2, .2, .2, 1);

    P = perspective(73.74, 1, 1, 31);

    Sun.P = P;
    Earth.P = P;
    Moon.P = P;


    requestAnimationFrame(render);
}

function render() {

    // Update your motion variables here
    year = Date.now() / 1000;
    day = Date.now() /1000;

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
    // Add your rendering sequence here

    ms = new MatrixStack();
    var V = translate(0.0, 0.0, -0.5*(10 + 30))
    ms.load(V)

    // Sun stack

    ms.push();
    ms.scale(3);
    Sun.MV = ms.current();
    Sun.render();
    ms.pop();

    // Earth stack

    ms.push();
    ms.rotate(year, vec3(0, 0, 1));
    ms.translate(10, 0, 0);
    ms.rotate(day, vec3(0, 0, 1));
    ms.push();
    ms.scale(2);
    Earth.MV = ms.current();
    Earth.render();
    ms.pop();

    // Moon stack

    ms.translate(4, 0, 0);
    ms.scale(1);
    Moon.MV = ms.current();
    Moon.render();
    ms.pop();

    requestAnimationFrame(render);
}

window.onload = init;