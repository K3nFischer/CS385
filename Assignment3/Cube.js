function Cube(gl) {

    var program = initShaders(gl, "Cube-vertex-shader", "Cube-fragment-shader");

    var positions = [
        0,0,0,1,0,0,1,1,0,0,1,0,0,0,1,1,0,1,1,1,1,0,1,1
    ];
    
    var indices = [
        0,1,2,0,2,3,1,6,2,1,5,6,5,7,6,5,4,7,2,6,7,2,7,3,4,3,7,4,0,3,4,0,1,4,1,5
    ];

    positions.numComponents = 3;

    positions.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW );

    indices.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indices.buffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW );

    positions.aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.enableVertexAttribArray( positions.aPosition );

    this.render = function () {
        gl.useProgram( program );

        gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
        gl.vertexAttribPointer( positions.aPosition, positions.numComponents,
            gl.FLOAT, false, 0, 0 );
 
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indices.buffer );
        gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );
    }
};
