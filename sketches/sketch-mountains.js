const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: 'true',
};

const params = {
  time: 7,
  timeAcceleration: 0.05,
  timeLimit: 20,
  skylineInterval: 200,
  skylineSpeed: 20,
  animate: true,
};

let cx = 0; // spin point x
let cy = 0; // spin point y
let ct = 0; // current time

let skylineStep = 0;
let skylines = [];
let skylinesCount = 6;

const sketch = ({ context: ctx, width, height }) => {
  cx = width * 0.5;
  cy = height * 0.5;
  
  skylines = [...Array(10)].map(() => {
    return generateSkyline(width, height);
  });

  return ({ context: ctx, width, height }) => {
    if (params.animate) {
      ct += params.timeAcceleration;
      if (ct > params.timeLimit) {
        ct = 0;
      }
      params.time = ct;
    } else {
      ct = params.time;
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    drawLand(ctx, ct, width, height);
    drawDebugData(ctx, ct, width, height);
  };
};

const drawSkyline = (ctx, skyline, addAlpha) => {
  ctx.translate(0, params.skylineInterval);
  ctx.lineWidth = 3;
  for (let i = 0; i < skyline.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = mountinesGradient(ctx, 300, addAlpha);
    const element = skyline[i];
    ctx.moveTo(element[0], element[1]);
    ctx.lineTo(element[0] + element[1], 0);
    ctx.lineTo(element[0] - element[1], 0);
    ctx.closePath();
    ctx.fill();
  }
}

const generateSkyline = (width, height) => {
  // Generate mountains
  let nodes = [];
  let stepsCount = random.range(5, 10);
  let step = width / stepsCount;
  for (let index = 1; index <= stepsCount; index++) {
    let x = step * index;
    let y = random.gaussian();
    y *= 85; // add amplitude
    y = y - (Math.sqrt(width * 0.5 * width * 0.5 - (x - width * 0.5) * (x - width * 0.5))) * 0.5; // correct height to be higher closer to center
    y = y * -Math.sign(y);
    nodes.push([x, y]);
  }
  return nodes;
};

const drawLand = (ctx, time, width, height) => {
  if (params.animate) {
    skylineStep += (params.skylineSpeed * params.timeAcceleration);
    if (skylineStep >= params.skylineInterval) {
      skylines.unshift(generateSkyline(width, height));
      skylineStep = 0;
      skylines = skylines.slice(0, skylinesCount);
    }
  }

  ctx.save();
  ctx.translate(0, cy);
  ctx.translate(0, -skylineStep);
  drawSkyline(ctx, skylines[0], false);
  ctx.restore();
  
  ctx.save();
  ctx.translate(0, cy); // Horizont
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, width, cy);
  ctx.restore();

  ctx.save();
  ctx.translate(0, cy - params.skylineInterval);
  ctx.translate(0, skylineStep);
  for (let sl = 1; sl < skylines.length; sl++) {
    ctx.globalAlpha = 1;
    const skyline = skylines[sl];
    drawSkyline(ctx, skyline, false);
    }
  ctx.restore();
};

const mountinesGradient = (ctx, height, addAlpha) => {
  let skylineGrad = ctx.createLinearGradient(0, 0, 0, -height);
  skylineGrad.addColorStop(0, '#bbd3de');
  skylineGrad.addColorStop(1, '#26465e');
  ctx.fillStyle = skylineGrad;
  if (addAlpha) {
    ctx.globalAlpha = math.mapRange(skylineStep, 0, params.skylineInterval, 0, 1);
  }
  return skylineGrad;
};

const drawDebugData = (ctx, time, width, height) => {
  ctx.save();
  ctx.font = "30px Georgia";
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.fillText(`Time: ${Math.round(time)}`, 20, 30);
  ctx.fill();
};

const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: 'Grid'});
  folder.addInput(params, 'time', { min: 0, max: params.timeLimit, step: 0.1});
  folder.addInput(params, 'timeAcceleration', { min: 0.01, max: 0.5, step: 0.01});
  folder.addInput(params, 'timeLimit', { min: 10, max: 50, step: 1});
  folder.addInput(params, 'animate');

  folder = pane.addFolder({ title: 'Skyline'});
  folder.addInput(params, 'skylineInterval', { min: 50, max: 400, step: 25});
  folder.addInput(params, 'skylineSpeed', { min: 5, max: 50, step: 5});
}

createPane();
canvasSketch(sketch, settings);
