// Watercolor texture for canvas-sketch
const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 720 ],
  fps: 10,
  animate: true,
};

// Main context
let ctx;
let brushOpacity = 0.1;
// Main color
let mainColorComponents = [random.range(0, 255), random.range(0, 255), random.range(0, 255)];
let mainColor = `rgb(${mainColorComponents[0]}, ${mainColorComponents[1]}, ${mainColorComponents[2]}, ${brushOpacity})`;
// Secondary color
let secondaryColorComponents = [random.range(0, 255), random.range(0, 255), random.range(0, 255)];
let secondaryColor = `rgb(${secondaryColorComponents[0]}, ${secondaryColorComponents[1]}, ${secondaryColorComponents[2]}, ${brushOpacity})`;
let textures = [];

// Function fill context with the texture
function createTextureCanvas(baseCtx) {
  let w = baseCtx.canvas.width;
  let h = baseCtx.canvas.height;
  // console.log(w * h / 500);
  // Create a new canvas
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = w * 1.1;
  textureCanvas.height = h * 1.1;
  const textureContext = textureCanvas.getContext('2d');
  
  // Create array of random objects
  let objects = [];
  for (let i = 0; i < w * h / 500; i++) {
    let x = random.range(0, w);
    let y = random.range(0, h);
    objects.push(createBrushSpot(x, y));
  }
  // Fill in the canvas with objects
  objects.forEach((object, index) => {
    let color = object.colors[0];
    if (index > objects.length * 4 / 5) {
      color = object.colors[1];
    }
    drawBrushSpot(textureContext, object, color);
  });
  return textureCanvas;
}

// Function draw a circle filled with the texture on a given context
function drawTexturedCircle(baseCtx) {
  // Draw a circle at random position
  let radius = 200;
  let x = baseCtx.canvas.width * 0.5;
  let y = baseCtx.canvas.height * 0.5;
  // Create a new canvas
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = radius * 2 * 1.1;
  textureCanvas.height = radius * 2 * 1.1;
  const textureContext = textureCanvas.getContext('2d');
  // Create array of random objects
  let objects = [];
  for (let i = 0; i < radius * 2; i++) {
    let x = random.range(0, textureCanvas.width);
    let y = random.range(0, textureCanvas.height);
    objects.push(createBrushSpot(x, y));
  }
  // Fill in the canvas with objects
  objects.forEach((object, index) => {
    let color = object.colors[0];
    if (index > objects.length * 4 / 5) {
      color = object.colors[1];
    }
    drawBrushSpot(textureContext, object, color);
  });
  // Draw a circle
  baseCtx.beginPath();
  baseCtx.translate(x - radius, y - radius);
  baseCtx.arc(radius, radius, radius, 0, Math.PI * 2);
  baseCtx.closePath();
  baseCtx.fillStyle = baseCtx.createPattern(textureCanvas, 'no-repeat');
  baseCtx.fill();
}

// Randomize mainColor
function randomizeColor(colorComponents) {
  let extraColorComponents = [random.range(-25, 25), random.range(-25, 25), random.range(-25, 25)];
  return `rgb(${colorComponents[0] + extraColorComponents[0]}, ${colorComponents[1] + extraColorComponents[1]}, ${colorComponents[2] + extraColorComponents[2]}, ${brushOpacity})`;
};

// Change main and secondary colors
function changeColors() {
  mainColorComponents = [random.range(0, 255), random.range(0, 255), random.range(0, 255)];
  mainColor = `rgb(${mainColorComponents[0]}, ${mainColorComponents[1]}, ${mainColorComponents[2]}, ${brushOpacity})`;
  secondaryColorComponents = [random.range(0, 255), random.range(0, 255), random.range(0, 255)];
  secondaryColor = `rgb(${secondaryColorComponents[0]}, ${secondaryColorComponents[1]}, ${secondaryColorComponents[2]}, ${brushOpacity})`;
}

// Add object to array at coordinates
function createBrushSpot(x, y) {
  return {
    x: x,
    y: y,
    radiuses: Array.from({ length: random.range(5, 10) }, () => random.range(60, 80)),
    colors: [randomizeColor(mainColorComponents), randomizeColor(secondaryColorComponents)],
    rotation: random.range(0, Math.PI * 2)
  };
}

let opacity = 0.0;

const sketch = ({ context, width, height }) => {
  ctx = context;
  textures.push(createTextureCanvas(ctx), createTextureCanvas(ctx));

  return ({ context, width, height }) => {
    ctx.fillStyle = ctx.createPattern(textures[0], 'no-repeat');
    ctx.fillRect(0, 0, width, height);
    opacity += 0.1;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = ctx.createPattern(textures[1], 'no-repeat');
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    if (opacity >= 1) {
      opacity = 0;
      textures.shift();
      changeColors();
      textures.push(createTextureCanvas(ctx));
    }
  };
};

canvasSketch(sketch, settings);

function drawBrushSpot(ctx, object, color) {
  // It draws a circle, plotting the vertices on circumference
  ctx.save();
  ctx.translate(object.x, object.y);
  ctx.rotate(object.rotation);
  ctx.filter = 'blur(5px)';

  ctx.beginPath();
  for (let i = 0; i < object.radiuses.length; i++) {
    let angle = i * Math.PI * 2 / object.radiuses.length;
    let r = object.radiuses[i];
    let x = Math.cos(angle) * r;
    let y = Math.sin(angle) * r;
    if (i == 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = 'black';
  ctx.fill();
  ctx.restore();
}