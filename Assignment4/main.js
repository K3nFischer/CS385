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
    Moon = new Sphere(12, 12);

    Sun.color = vec4(1, .7, 0, 1);
    Earth.color = vec4(0, .2, 1, 1);
    Moon.color = vec4(.2, .2, .2, 1);

    year = day = 0;



    requestAnimationFrame(render);
}

function render() {

    // Update your motion variables here
    year++;
    day++;

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    
    // Add your rendering sequence here

    ms = new MatrixStack();
    var V = translate(0.0, 0.0, 0.0, -0.5*(1 + 30))
    ms.load(V)

    ms.push();
    ms.scale(3);
    Sun.draw();
    ms.pop();

    ms.push();
    ms.rotate(year, axis);
    ms.translate(10, 0, 0);
    ms.push();
    ms.rotate(day, axis);
    ms.scale(2);
    Earth.draw();
    ms.pop();

    ms.translate(4, 0, 0);
    ms.scale(1);
    Moon.draw();
    ms.pop();

    requestAnimationFrame(render);
}

window.onload = init;