// Watercolor texture for canvas-sketch
const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 720 ],
  // animate: true,
};

// Main context
let ctx;
// Main color
let brushOpacity = 0.1;
let mainColorComponents = [random.range(0, 255), random.range(0, 255), random.range(0, 255)];
let mainColor = `rgb(${mainColorComponents[0]}, ${mainColorComponents[1]}, ${mainColorComponents[2]}, ${brushOpacity})`;
// Array of objects with position, size, color and rotation
const objects = [];
let blur = true;

// Function draw a circle filled with the texture on a given context
function drawTexturedCircle(baseCtx) {
  // Draw a circle at random position
  let radius = random.range(100, 200);
  let x = random.range(radius * 2, ctx.canvas.width - radius * 2);
  let y = random.range(radius * 2, ctx.canvas.height - radius * 2);
  // Create a new canvas
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = radius * 2 * 1.1;
  textureCanvas.height = radius * 2 * 1.1;
  const textureContext = textureCanvas.getContext('2d');
  // Create array of random objects
  let objects = [];
  for (let i = 0; i < radius; i++) {
    let x = random.range(0, textureCanvas.width);
    let y = random.range(0, textureCanvas.height);
    objects.push(createObject(x, y));
  }
  // Fill in the canvas with objects
  objects.forEach((object) => {
    drawCircle(textureContext, object);
  });
  // Draw a circle
  baseCtx.beginPath();
  baseCtx.translate(x, y);
  baseCtx.arc(radius, radius, radius, 0, Math.PI * 2);
  baseCtx.closePath();
  baseCtx.fillStyle = baseCtx.createPattern(textureCanvas, 'no-repeat');
  baseCtx.fill();
}

// On mouse click, get position relative to context
document.addEventListener('click', (e) => {
  const rect = ctx.canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  // If click is inside color picker, randomize mainColor
  if (x > 10 && x < 60 && y > 10 && y < 60) {
    mainColorComponents = [random.range(0, 255), random.range(0, 255), random.range(0, 255)];
    mainColor = `rgb(${mainColorComponents[0]}, ${mainColorComponents[1]}, ${mainColorComponents[2]}, ${brushOpacity})`;
  }
});

// Randomize mainColor
function randomizeMainColor() {
  let extraColorComponents = [random.range(-25, 25), random.range(-25, 25), random.range(-25, 25)];
  return `rgb(${mainColorComponents[0] + extraColorComponents[0]}, ${mainColorComponents[1] + extraColorComponents[1]}, ${mainColorComponents[2] + extraColorComponents[2]}, ${brushOpacity})`;
};

// Get mouse position on mousemove relative to canvas
window.addEventListener('mousemove', (event) => {
  if (event.buttons != 1) return; // Ignore if no button pressed

  const rect = ctx.canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  objects.push(createObject(x, y));
});

// Add object to array at coordinates
function createObject(x, y) {
  return {
    x: x,
    y: y,
    radiuses: Array.from({ length: random.range(5, 10) }, () => random.range(60, 80)),
    color: randomizeMainColor(),
    rotation: random.range(0, Math.PI * 2)
  };
}

const sketch = ({ context, width, height }) => {
  ctx = context;
  return ({ context, width, height }) => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = mainColor;
    ctx.fillRect(10, 10, 60, 60);

    objects.forEach ((object) => {
      drawCircle(ctx, object);
    });

    drawTexturedCircle(ctx);
  };
};

canvasSketch(sketch, settings);

// Draw a circle plotting the vertices on circumference
function drawCircle(ctx, object) {
  ctx.save();
  ctx.translate(object.x, object.y);
  ctx.rotate(object.rotation);
  if (blur) {
    ctx.filter = 'blur(5px)';
  }
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
  ctx.fillStyle = object.color;
  ctx.strokeStyle = 'black';
  ctx.fill();
  ctx.restore();
}