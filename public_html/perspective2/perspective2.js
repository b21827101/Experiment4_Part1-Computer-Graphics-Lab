var canvas;
var gl;

var NumVertices  = 36;
var isM =false;
var pointsArray = [];
var colorsArray = [];

var moveCallback;

var vertices = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4( 0.5, -0.5, 0.5, 1.0) 
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];

var near = 0.3;
var far = 3.0;
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


var x = 0.00;
var y = 0.00;
function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]);     
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]);  
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL2 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var havePointerLock = 'pointerLockElement' in document ||
        'mozPointerLockElement' in document ||
        'webkitPointerLockElement' in document;

    // element for pointerLock
    // prefixes
    canvas.requestPointerLock =
        canvas.requestPointerLock ||
        canvas.mozRequestPointerLock ||
        canvas.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;


    var lockChange = function() {
        if (!havePointerLock) {
            return;
        }
        if (document.pointerLockElement  === canvas ||
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas ) {
            document.addEventListener("mousemove", moveCallback, false);
        }
        else {
            document.removeEventListener("mousemove", moveCallback, false);
        }

    }
    document.addEventListener('pointerlockchange', lockChange, false);
    document.addEventListener('mozpointerlockchange', lockChange, false);
    document.addEventListener('webkitpointerlockchange', lockChange, false);

     moveCallback = function(e) {

        isM = true;
        x = e.movementX ||
            e.mozMovementX ||
            e.webkitMovementX ||
            0;
        y = e.movementY ||
            e.mozMovementY ||
            e.webkitMovementY ||
            0;
     }
    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // sliders for viewing parameters

    document.getElementById("zFarSlider").onchange = function() {
        far = event.srcElement.value;
    };
    document.getElementById("zNearSlider").onchange = function() {
        near = event.srcElement.value;
    };
    document.getElementById("radiusSlider").onchange = function() {
       radius = event.srcElement.value;
    };
    document.getElementById("aspectSlider").onchange = function() {
        aspect = event.srcElement.value;
    };
    document.getElementById("fovSlider").onchange = function() {
        fovy = event.srcElement.value;
    };

    render();
}

document.onkeydown = function (e) {
    switch (e.key) {
        case "p": //Use ‘p’ key
            if (!pointerLockApi()) {
                canvas.requestPointerLock();
            }else {
                document.exitPointerLock();
            }
            break;
        default:
            break;
    }
}
var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var dr1 = 0.01;
    if(isM) {
        var denemex = theta -(dr1*x);
        var denemey = phi +(dr1*2*y);

        if(denemex<1.55 && denemex>-1.55)
            theta -= dr1 * x;
        if(denemey<1.55 && denemey>-1.55)
            phi += dr1 * 2* y;
        isM =false;
    }
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
            
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    requestAnimFrame(render);
}

/*
vposition-> aPosition
vColor -> aColor
fColor -> vColor
 */

var pointerLockApi = function() {
    return canvas ===
        document.pointerLockElement ||
        canvas ===
        document.mozPointerLockElement ||
        canvas ===
        document.webkitPointerLockElement;
}