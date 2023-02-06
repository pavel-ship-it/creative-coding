// Spiral
const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: 'true',
  fps: 30,
};

const params = {
  cols: 6,
  rows: 8,
  foreground: '#0000FF',
  background: 'white',
  floorsNumber: 4,
  outerRadius: 400,
  stepsPerFloor: 25,
  hideGuidelines: true,
  uWidth: 80,
  uHeight: 80,
};

function stepsNumber() { return params.floorsNumber * params.stepsPerFloor + 1; };
function shrinkRadius() { return params.outerRadius / params.floorsNumber; };
function stepRotation() { return (Math.PI * 2 / params.stepsPerFloor); }

const sketch = ({ context, width, height }) => {
  return ({ context, width, height, frame }) => {
    const cx = width * 0.5;
    const cy = height * 0.5;

    context.save();
    context.fillStyle = params.background;
    context.fillRect(0, 0, width, height);

    context.translate(cx, cy);

    // Draw spiral
    for (var i = stepsNumber(); i >= 0; i--) {
      drawStep(i, context, frame);
    }

    drawGuidelines(context, width, height);
    context.restore();
  };
};

const drawStep = (stepCount, context, frame) => {
  const stepShift = shrinkRadius() / params.stepsPerFloor; // Each step is closer to center than previous
  const stepFading = 0.01;
  const framePhase = frame % settings.fps;

  const stepScale = 1 - stepCount / stepsNumber();
  const stepW = params.uWidth * stepScale;
  const stepL = params.uHeight * stepScale;

  context.save();
  context.rotate(stepRotation() * stepCount);
  context.rotate(framePhase * (stepRotation() / settings.fps));
  context.strokeStyle = params.foreground;
  context.fillStyle = params.foreground;
  context.globalAlpha = 1 - stepCount * stepFading;
  context.lineWidth = 3;
  context.translate(0, -stepW * 0.5); // shift up a bit
  context.translate(params.outerRadius - stepCount * stepShift, 0);

  context.beginPath();
  context.fillRect(0, 0, stepL, stepW);
  context.fill();

  context.restore();
};

const drawGuidelines = (context, width, height) => {
  if (params.hideGuidelines) return;

  context.save();
  context.strokeStyle = 'green';
  context.lineWidth = 2;


  for (var i = 0; i < params.floorsNumber + 1; i++) {
    context.beginPath();
    context.arc(0, 0, params.outerRadius - shrinkRadius() * i, 0, Math.PI * 2);
    context.stroke();
  }

  context.beginPath();
  context.moveTo(-width, 0);
  context.lineTo(width, 0);
  context.stroke();

  context.beginPath();
  context.moveTo(0, -height);
  context.lineTo(0, height);
  context.stroke();

  context.restore();
};

const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: 'Spiral'});
  folder.addInput(params, 'outerRadius', { min: 200, max: 600, step: 50 });
  folder.addInput(params, 'floorsNumber', { min: 1, max: 10, step: 1});
  folder.addInput(params, 'stepsPerFloor', { min: 10, max: 50, step: 1});
  folder = pane.addFolder({ title: 'Units' });
  folder.addInput(params, 'uWidth', { min: 10, max: 300, step: 10});
  folder.addInput(params, 'uHeight', { min: 10, max: 300, step: 10});
}

createPane();
canvasSketch(sketch, settings);
