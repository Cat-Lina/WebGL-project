// Vertex shader for single color drawing
var SOLID_VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  vec3 lightDirection = vec3(0.0, 0.0, 1.0);\n' + // Light direction(World coordinate)
　'  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_Color = vec4(a_Color.rgb * nDotL, a_Color.a);\n' +
  '}\n';

// Fragment shader for single color drawing
var SOLID_FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Vertex shader for texture drawing
var TEXTURE_VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying float v_NdotL;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  vec3 lightDirection = vec3(0.0, 0.0, 1.0);\n' + // Light direction(World coordinate)
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_NdotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader for texture drawing
var TEXTURE_FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying float v_NdotL;\n' +
  'void main() {\n' +
  '  vec4 color = texture2D(u_Sampler, v_TexCoord);\n' +
  '  gl_FragColor = vec4(color.rgb * v_NdotL, color.a);\n' +
  '}\n';


function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  var solidProgram = createProgram(gl, SOLID_VSHADER_SOURCE, SOLID_FSHADER_SOURCE);
  var texProgram = createProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);
  if (!solidProgram || !texProgram) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get storage locations of attribute and uniform variables in program object for single color drawing
  solidProgram.a_Position = gl.getAttribLocation(solidProgram, 'a_Position');
  solidProgram.a_Normal = gl.getAttribLocation(solidProgram, 'a_Normal');
  solidProgram.a_Color = gl.getAttribLocation(solidProgram, 'a_Color');
  solidProgram.u_MvpMatrix = gl.getUniformLocation(solidProgram, 'u_MvpMatrix');
  solidProgram.u_NormalMatrix = gl.getUniformLocation(solidProgram, 'u_NormalMatrix');

  // Get storage locations of attribute and uniform variables in program object for texture drawing
  texProgram.a_Position = gl.getAttribLocation(texProgram, 'a_Position');
  texProgram.a_Normal = gl.getAttribLocation(texProgram, 'a_Normal');
  texProgram.a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
  texProgram.u_MvpMatrix = gl.getUniformLocation(texProgram, 'u_MvpMatrix');
  texProgram.u_NormalMatrix = gl.getUniformLocation(texProgram, 'u_NormalMatrix');
  texProgram.u_Sampler = gl.getUniformLocation(texProgram, 'u_Sampler');

  if (solidProgram.a_Position < 0 || solidProgram.a_Normal < 0 || 
      !solidProgram.u_MvpMatrix || !solidProgram.u_NormalMatrix ||
      texProgram.a_Position < 0 || texProgram.a_Normal < 0 || texProgram.a_TexCoord < 0 ||
      !texProgram.u_MvpMatrix || !texProgram.u_NormalMatrix || !texProgram.u_Sampler) { 
    console.log('Failed to get the storage location of attribute or uniform variable'); 
    return;
  }

  // Set the vertex information
  var cube = initVertexBuffers(gl,1,1,1,1);
  if (!cube) {
    console.log('Failed to set the vertex information');
    return;
  }

  var triangle= initVertexBuffersTriangle(gl);
  if (!triangle) {
    console.log('Failed to set the vertex information');
    return;
  }

  var bar = initVertexBuffers(gl, 1.0,  1.0,  1.0,  1);
  if (!bar) {
    console.log('Failed to set the vertex information');
    return;
  }

  var fence = initVertexBuffers (gl,0,0,0,0);
  if (!fence) {
    console.log('Failed to set the vertex information');
    return;
  }

  var glass = initVertexBuffers(gl, 0,0,0,  0.6);
  if (!glass) {
    console.log('Failed to set the vertex information');
    return;
  }

  var cone = initVertexBuffersCone(gl);
  if (!cone) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set texture
  var texture = initTextures(gl, texProgram,'../resources/brick.png',0);
  if (!texture) {
    console.log('Failed to intialize the texture.');
    return;
  }

  var textureWater = initTextures(gl, texProgram,'../resources/water.png',1);
  if (!textureWater) {
    console.log('Failed to intialize the texture water.');
    return;
  }

  var textureFence = initTextures(gl, texProgram,'../resources/wood.jpg',1);
  if (!textureFence){
    console.log('Failed to intialize the texture wood.');
    return;
  }

  var textureRoof = initTextures(gl, texProgram,'../resources/roof.png',1);
  if (!textureRoof) {
    console.log('Failed to intialize the texture roof.');
    return;
  }

  var textureGrass = initTextures(gl, texProgram,'../resources/grass.png',1);
  if (!textureGrass) {
    console.log('Failed to intialize the texture roof.');
    return;
  }

  // Set the clear color and enable the depth test
  gl.enable(gl.DEPTH_TEST);
  // Specify the color for clearing <canvas>
  gl.clearColor(1, 223/255, 221/255, 1);
  // Enable alpha blending
  gl.enable (gl.BLEND);
  // Set blending function
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Calculate the view projection matrix
  var viewProjMatrix = new Matrix4();
  
  viewProjMatrix.setPerspective(zoom, canvas.width/canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  document.onkeydown = function(ev){
    keydown(ev, viewProjMatrix,canvas);
  };

  
  var tick = function() {
    currentAngle = animate(currentAngle);
    console.log(currentAngle);
    draw(gl, solidProgram,texProgram, cube,cone,bar,triangle,glass, viewProjMatrix,texture,textureWater,textureRoof,textureFence,textureGrass);
    window.requestAnimationFrame(tick, canvas);
  };

  tick();

  draw(gl, solidProgram,texProgram, cube,cone,bar,triangle,glass, viewProjMatrix,texture,textureWater,textureRoof,textureFence,textureGrass);
}

function drawDoor(gl, solidProgram, bar,glass, viewProjMatrix,texProgram, cube, textureWater){
  
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 4, 0.005);  // Translation
    g_modelMatrix.scale(1.5, 2.0, 0.01); // Scale
    drawTexCube(gl, texProgram, cube, textureWater, 0.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-1.4, 3.8, 0);  // Translation
    g_modelMatrix.scale(0.2, 2.3, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-0.5, 5, 0);  // Translation
    g_modelMatrix.scale(0.05, 1.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.4, 5, 0);  // Translation
    g_modelMatrix.scale(0.05, 1.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(1.4, 3.8, 0);  // Translation
    g_modelMatrix.scale(0.2, 2.3, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 1.6, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.1, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 4, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.1, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 5.25, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.13, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 6, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.1, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 3, 0);  // Translation
    g_modelMatrix.scale(0.3, 1.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 2.8, 0);  // Translation
    g_modelMatrix.scale(1.5, 1.2, 0.02); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
}

function drawWindow(gl, solidProgram, bar,glass, viewProjMatrix,texProgram, cube, textureWater){
  
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 4, 0.005);  // Translation
    g_modelMatrix.scale(1.5, 2.0, 0.01); // Scale
    drawTexCube(gl, texProgram, cube, textureWater, 0.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-1.4, 4, 0);  // Translation
    g_modelMatrix.scale(0.1, 2.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-0.5, 4, 0);  // Translation
    g_modelMatrix.scale(0.05, 2.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.4, 4, 0);  // Translation
    g_modelMatrix.scale(0.05, 2.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(1.4, 4, 0);  // Translation
    g_modelMatrix.scale(0.1, 2.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 2, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.1, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 3, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.05, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 4, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.1, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 5, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.05, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();


  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 6, 0);  // Translation
    g_modelMatrix.scale(1.5, 0.1, 0.1); // Scale
    drawSolidCube(gl, solidProgram, bar, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, 4, 0);  // Translation
    g_modelMatrix.scale(1.5, 2.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, glass, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
}


function draw(gl, solidProgram,texProgram, cube,cone,bar,triangle, glass, viewProjMatrix,texture,textureWater,textureRoof,textureFence,textureGrass){
  
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear color and depth bufferss
g_modelMatrix.setRotate(20.0, 1.0, 1.0, 0.0);
g_modelMatrix.rotate(40.0, 0.0, -1.0, 0.0);
g_modelMatrix.rotate(g_yAngle, 0, 1, 0); // Rotate along y axis
g_modelMatrix.rotate(g_xAngle, 1, 0, 0); // Rotate along x axis

pushMatrix(g_modelMatrix);

  //grass
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0, -3, 0);  // Translation
    g_modelMatrix.scale(8, 0.1, 7); // Scale
    drawTexCube(gl, texProgram, cube, textureGrass, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  //chimney
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.3, 4.5, 0.2);  // Translation
    g_modelMatrix.scale(0.4, 0.8, 1.0); // Scale
    drawTexCube(gl, texProgram, cube, texture, 2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  //roof
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-3.3,3,-3.3);  // Translation
    g_modelMatrix.scale(2.2, 1.4, 2.2); // Scale
    drawTexCube(gl, texProgram, cone, textureRoof, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  //brick house block
  pushMatrix(g_modelMatrix);
    g_modelMatrix.scale(3.0, 3.0, 3.0); // Scale
    drawTexCube(gl, texProgram, cube, texture, 2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.scale(0.3, 0.55, 0.55); // Scale
    g_modelMatrix.translate(4, -6.5, 5.5);
    drawDoor(gl, solidProgram, bar,glass, viewProjMatrix,texProgram, cube, textureWater)
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.scale(0.3, 0.55, 0.55); // Scale
    g_modelMatrix.translate(-4, -0.8, 5.5);
    drawWindow(gl, solidProgram, bar, glass, viewProjMatrix,texProgram, cube, textureWater)
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.scale(0.3, 0.55, 0.55); // Scale
    g_modelMatrix.translate(4, -0.8, 5.5);
    drawWindow(gl, solidProgram, bar, glass, viewProjMatrix,texProgram, cube, textureWater)
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
    g_modelMatrix.scale(0.3, 0.55, 0.55); // Scale
    g_modelMatrix.translate(-4, -6.0, 5.5);
    drawWindow(gl, solidProgram, bar, glass, viewProjMatrix,texProgram, cube, textureWater)
  g_modelMatrix = popMatrix();
  //side windows w1
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(3, -0.5, -1);
    g_modelMatrix.rotate(90,0,1,0);
    g_modelMatrix.scale(0.3, 0.55, 0.55); // Scale
    drawWindow(gl, solidProgram, bar, glass, viewProjMatrix,texProgram, cube, textureWater)
  g_modelMatrix = popMatrix();
  //side windows w2
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(3, -3.5, -1);
    g_modelMatrix.rotate(90,0,1,0);
    g_modelMatrix.scale(0.3, 0.55, 0.55); // Scale
    drawWindow(gl, solidProgram, bar, glass, viewProjMatrix,texProgram, cube, textureWater)
  g_modelMatrix = popMatrix();

  //full fence
  pushMatrix(g_modelMatrix);
    g_modelMatrix.scale(1.5,1.0,1.3);
    drawFullFence(gl, texProgram, cube, textureFence, viewProjMatrix)
  g_modelMatrix = popMatrix();
g_modelMatrix = popMatrix();

//swing
pushMatrix(g_modelMatrix);
  g_modelMatrix.scale(0.7, 0.7, 0.7); // Scale
  g_modelMatrix.translate(7, -2, 0);
  drawSwing(gl, solidProgram, cube, viewProjMatrix);
g_modelMatrix = popMatrix();

}



function drawFullFence(gl, texProgram, cube, textureFence, viewProjMatrix){
  pushMatrix(g_modelMatrix);
    drawFence(gl, texProgram, cube, textureFence, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-0.1, 0.0, 1);
    g_modelMatrix.rotate(90.0, 0.0, 1.0, 0.0)
    drawFence(gl, texProgram, cube, textureFence, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(1.0, 0.0, 0.1);
    g_modelMatrix.rotate(90.0, 0.0, -1.0, 0.0)
    drawFence(gl, texProgram, cube, textureFence, viewProjMatrix);
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, -9);
    drawFence(gl, texProgram, cube, textureFence, viewProjMatrix);
  g_modelMatrix = popMatrix();
}

function drawSwing(gl, solidProgram, cube, viewProjMatrix){
  var dif=0;
  var sign=1.0;
  var after45=currentAngle
  if (currentAngle>120){
    currentAngle=currentAngle%120;
    after45=currentAngle
    var sign=1.0;
  }
  else if (currentAngle>=90){
    dif=(currentAngle%90);
    after45=-(30-dif);
    sign=1.0;
  }
  else if (currentAngle>=60){
    dif=(currentAngle%60);
    after45=dif;
    sign=-1.0;
  }
  else if (currentAngle>30){
    dif=(currentAngle%30);
    after45=-(30-dif);
    sign=-1.0;
  }

  //upper horizontal bar
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(1, 4, 0);  // Translation
    g_modelMatrix.scale(2.1, 0.1, 0.1); // Scale
    drawSolidCube(gl, solidProgram, cube, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  //left-most long bar
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(-1, 1, 0);  // Translation
    g_modelMatrix.scale(0.1, 3.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, cube, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
  //right-most long bar
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(3, 1, 0);  // Translation
    g_modelMatrix.scale(0.1, 3.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, cube, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();

  //left-most short bar
  pushMatrix(g_modelMatrix);

    g_modelMatrix.translate(0, 4, 0); 
    g_modelMatrix.rotate(after45, sign, 0.0, 0.0);
    g_modelMatrix.translate(0, -4, 0);

    g_modelMatrix.translate(0, 2, 0); 
    g_modelMatrix.scale(0.1, 2.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, cube, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
    //right-most short bar
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(2, 4, 0); 
    g_modelMatrix.rotate(after45, sign, 0.0, 0.0);
    g_modelMatrix.translate(-2, -4, 0);

    g_modelMatrix.translate(2, 2, 0); 
    g_modelMatrix.scale(0.1, 2.0, 0.1); // Scale
    drawSolidCube(gl, solidProgram, cube, -2.0, viewProjMatrix);
  g_modelMatrix = popMatrix();
    //seat
    g_modelMatrix.translate(1, 4, 0);
    g_modelMatrix.rotate(after45, sign, 0.0, 0.0);
    g_modelMatrix.translate(-1, -4, 0);

    g_modelMatrix.translate(1, 0, 0);
    g_modelMatrix.scale(1.0, 0.1, 0.7); // Scale
    drawSolidCube(gl, solidProgram, cube, -2.0, viewProjMatrix);

}


function drawFence(gl, texProgram, cube, textureFence, viewProjMatrix){
  x=-4
  while (x<5){
    pushMatrix(g_modelMatrix);
      g_modelMatrix.translate(x, -2, 5);
      g_modelMatrix.scale(0.1,1.0,0.05); // Scale
      drawTexCube(gl, texProgram, cube, textureFence, 2.0, viewProjMatrix);
    g_modelMatrix = popMatrix();
    x+=0.25
  }
}

function keydown(ev, viewProjMatrix,canvas) {
  switch (ev.keyCode) {
    case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
      g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
      break;
    case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
      g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
      break;
    case 87: //w is pressed
      zoom+=5.00
      viewProjMatrix.setPerspective(zoom, canvas.width/canvas.height, 1.0, 100.0);
      viewProjMatrix.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    case 83: //s is pressed
      zoom-=5.00
      viewProjMatrix.setPerspective(zoom, canvas.width/canvas.height, 1.0, 100.0);
      viewProjMatrix.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      break;
    default: return; // Skip drawing at no effective action
  }
  

}
function initVertexBuffersCone(gl) {

  var vertices = new Float32Array([   // Vertex coordinates
    
    0.0,0.0,0.0,   0.0,0.0,3.0,   3.0,0.0, 3.0,  3.0,0.0, 0.0,
    3.0,0.0,3.0,  1.8,1.0, 1.8, 1.8,1.0, 1.2,  3.0,0.0,0.0, //second
    3.0,0.0,0.0,  1.8,1.0,1.2,  1.2,1.0, 1.2,  0.0,0.0,0.0, //third
    0.0,0.0,0.0,  1.2,1.0,1.2,  1.2,1.0,1.8,  0.0,0.0,3.0, //fourth
    0.0,0.0,3.0,  1.2,1.0,1.8,  1.8,1.0, 1.8,  3.0,0.0,3.0   //last


  ]);

  
  var colors = new Float32Array([    // Colors
    0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,    // v0-v1-v2-v3 front
    0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,     // v0-v3-v4-v5 right
    0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,     // v0-v5-v6-v1 up
    0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,        // v1-v6-v7-v2 left
    0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1    // v7-v4-v3-v2 down
 ]);


  var normals = new Float32Array([   // Normal
     0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 1.0,    // v0-v1-v2-v3 front
     3.0, 3.599, 0.0,   3.0, 3.599, 0.0,   3.0, 3.599, 0.0,   3.0, 3.599, 0.0,     // v0-v3-v4-v5 right
     0.0, 3.599, -3.0,  0.0, 3.599, -3.0,  0.0, 3.599, -3.0,  0.0, 3.599, -3.0,    // v0-v5-v6-v1 up
     -3.0, 3.599, 0.0,  -3.0, 3.599, 0.0,  -3.0, 3.599, 0.0,  -3.0, 3.599, 0.0,     // v1-v6-v7-v2 left
     0.0, 3.599, 3.0,   0.0, 3.599, 3.0,    0.0, 3.599, 3.0,   0.0, 3.599, 3.0    // v7-v4-v3-v2 down
  ]);

  var texCoords = new Float32Array([   // Texture coordinates
     0.0, 0.0,   0.4, 0.8,   0.6, 0.8,   1.0, 0.0,
     0.0, 0.0,   0.4, 0.8,   0.6, 0.8,   1.0, 0.0,   // v0-v1-v2-v3 front
     0.0, 0.0,   0.4, 0.8,   0.6, 0.8,   1.0, 0.0,    // v0-v3-v4-v5 right
     0.0, 0.0,   0.4, 0.8,   0.6, 0.8,   1.0, 0.0,   // v0-v5-v6-v1 up
     0.0, 0.0,   0.4, 0.8,   0.6, 0.8,   1.0, 0.0,   // v1-v6-v7-v2 left
     0.0, 0.0,   0.4, 0.8,   0.6, 0.8,   1.0, 0.0   // v7-v4-v3-v2 down
  ]);

  var indices = new Uint8Array([        // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19    // down

  ]);

  var o = new Object(); // Utilize Object to to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
  o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  if (!o.vertexBuffer || !o.normalBuffer || !o.texCoordBuffer || !o.indexBuffer||!o.colorBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}


function initVertexBuffersTriangle(gl) {
  var vertices = new Float32Array([   // Vertex coordinates
    0.0,  0.5,  -0.4,  // The back green one
   -0.5, -0.5,  -0.4,  
    0.5, -0.5,  -0.4
  ]);

  var colors = new Float32Array([    // Colors
    0.4,  1.0,  0.4,  0.4,
    0.4,  1.0,  0.4,  0.4,
    1.0,  0.4,  0.4,  0.4
 ]);

  var indices = new Uint8Array([        // Indices of the vertices
     0, 1, 2
  ]);

  var o = new Object(); // Utilize Object to to return multiple buffer objects together
  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 4, gl.FLOAT);
  if (!o.vertexBuffer || !o.indexBuffer||!o.colorBuffer) return null; 
  o.numIndices = indices.length;
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}


function initVertexBuffers(gl,R,G,B,A) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  
  var colors = new Float32Array([    // Colors
    R,G,B,A, R,G,B,A, R,G,B,A, R,G,B,A,
    R,G,B,A, R,G,B,A, R,G,B,A, R,G,B,A,
    R,G,B,A, R,G,B,A, R,G,B,A, R,G,B,A,
    R,G,B,A, R,G,B,A, R,G,B,A, R,G,B,A,
    R,G,B,A, R,G,B,A, R,G,B,A, R,G,B,A,
    R,G,B,A, R,G,B,A, R,G,B,A, R,G,B,A
 ]);


  var normals = new Float32Array([   // Normal
     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
     0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
     0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
  ]);

  var texCoords = new Float32Array([   // Texture coordinates
     2.5, 2.5,   0.0, 2.5,   0.0, 0.0,   2.5, 0.0,    // v0-v1-v2-v3 front
     0.0, 2.5,   0.0, 0.0,   2.5, 0.0,   2.5, 2.5,    // v0-v3-v4-v5 right
     2.5, 0.0,   2.5, 2.5,   0.0, 2.5,   0.0, 0.0,    // v0-v5-v6-v1 up
     2.5, 2.5,   0.0, 2.5,   0.0, 0.0,   2.5, 0.0,    // v1-v6-v7-v2 left
     0.0, 0.0,   2.5, 0.0,   2.5, 2.5,   0.0, 2.5,    // v7-v4-v3-v2 down
     0.0, 0.0,   2.5, 0.0,   2.5, 2.5,   0.0, 2.5    // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([        // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  var o = new Object(); // Utilize Object to to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
  o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 4, gl.FLOAT);
  if (!o.vertexBuffer || !o.normalBuffer || !o.texCoordBuffer || !o.indexBuffer||!o.colorBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initTextures(gl, program,source,unit) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return null;
  }

  var image = new Image();  // Create a image object
  if (!image) {
    console.log('Failed to create the image object');
    return null;
  }
  // Register the event handler to be called when image loading is completed
  image.onload = function() {
    // Write the image data to texture object
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    // bind a texture to texture unit x
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Pass the texure unit 0 to u_Sampler
    gl.useProgram(program);
    gl.uniform1i(program.u_Sampler, Uint8Array);

    gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture

  };

  // Tell the browser to load an Image
  image.src = source;

  return texture;
}

function drawSolidCube(gl, program, o, x, viewProjMatrix) {
  gl.useProgram(program);   // Tell that this program object is used

  // Assign the buffer objects and enable the assignment
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer); // Vertex coordinates
  initAttributeVariable(gl, program.a_Normal, o.normalBuffer);   // Normal
  initAttributeVariable(gl, program.a_Color, o.colorBuffer); 
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);  // Bind indices
 
  drawCube(gl, program, o, x, viewProjMatrix);   // Draw
}

function drawTriangle(gl, program, o, x, viewProjMatrix) {
  gl.useProgram(program);   // Tell that this program object is used
  // Assign the buffer objects and enable the assignment
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer); // Vertex coordinates
  initAttributeVariable(gl, program.a_Color, o.colorBuffer); 
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);  // Bind indices
 
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

  // Calculate model view projection matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);   // Draw
}

function drawTexCube(gl, program, o, texture, x, viewProjMatrix) {
  gl.useProgram(program);   // Tell that this program object is used

  // Assign the buffer objects and enable the assignment
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer);  // Vertex coordinates
  initAttributeVariable(gl, program.a_Normal, o.normalBuffer);    // Normal
  initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);// Texture coordinates
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices

  // Bind texture object to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  drawCube(gl, program, o, x, viewProjMatrix); // Draw
}

// Assign the buffer objects and enable the assignment
function initAttributeVariable(gl, a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

var ANGLE_STEP = 15.0;  // The increments of rotation angle (degrees)
var g_xAngle = 0.0;    // The rotation x angle (degrees)
var g_yAngle = 0.0;    // The rotation y angle (degrees)
var zoom=70.0;
var g_joint3Angle = 0.0;  // The rotation angle of joint3 (degrees)

var currentAngle = 0.0;

var last = Date.now(); // Last time that this function was called
function animate(angle) {
  var now = Date.now();   // Calculate the elapsed time
  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}
function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}


function drawCube(gl, program, o, x, viewProjMatrix) {
  // Calculate a model matrix
  //g_modelMatrix.setTranslate(x, 0.0, 0.0);

  // Calculate transformation matrix for normals and pass it to u_NormalMatrix
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

  // Calculate model view projection matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);
  gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);   // Draw
}


function initArrayBufferForLaterUse(gl, data, num, type) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Keep the information necessary to assign to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
  var buffer = gl.createBuffer();　  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}

