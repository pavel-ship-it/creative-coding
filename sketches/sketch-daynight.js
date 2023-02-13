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
  animate: true,
};

let cx = 0; // spin point x
let cy = 0; // spin point y
let ct = 0; // current time

let skyWidth = params.timeLimit * 10;
let skyHeight = 20;

let skylineInterval = 70;
let skylineStep = 0;
let skylines = [];

const generateSkyImage = () => {
  // Create 2 gradients
  // first - top colors
  // second - bottom colors
  // Spread from 0 to 1 counting smaller interval for dusk/sunset and dawn/sunrise
  const skyCanvas = document.createElement('canvas');
  const skyContext = skyCanvas.getContext('2d', { willReadFrequently: true });
  const skyTop = skyContext.createLinearGradient(0, 0, skyWidth, 10);
  const skyBottom = skyContext.createLinearGradient(0, 0, skyWidth, 10);
  // Day times
  // Night   22:00...4:59  Dark    0  0     0
  // Morning 5:00...11:59  Sunrise 5  10
  // Day     12:00...16:59 Light   12 14:30
  // Evening 17:00...21:59 Sunset  17 19:30

  // Colors of the sky
  // Dawn '#5e4e82, '#be8782'
  // Sunrise '#5b8ed7', '#ebd883'
  // Morning '#60a5f3', '#94ccfc'
  // Afternoon '#3f85d8', '#94ccfc'
  // Sunset '#7c527e', '#eea334'
  // Dusk '#353d82', '#e38341'
  // Night '#0a1427', '#1d4173'

  const topColors = [[0, '#0a1427'], // Night
                     [5, '#0a1427'], // Night
                     [7, '#5b8ed7'], // Sunrise
                     [9, '#3f85d8'], // Day
                     [17, '#3f85d8'], // Day
                     [18, '#7c527e'], // Sunset
                     [19, '#0a1427'], // Night
                     [24, '#0a1427']]; // Night
  const bottomColors = [[0, '#1d4173'],
                       [5, '#1d4173'],
                       [7, '#ebd883'],
                       [9, '#94ccfc'],
                       [17, '#94ccfc'],
                       [18, '#eea334'],
                       [19, '#1d4173'],
                       [24, '#1d4173']];
  topColors.forEach(element => {
    const coord = math.mapRange(element[0], 0, 24, 0, 1);
    skyTop.addColorStop(coord, element[1]);    
  });
  bottomColors.forEach(element => {
    const coord = math.mapRange(element[0], 0, 24, 0, 1);
    skyBottom.addColorStop(coord, element[1]);    
  });
  skyBottom.addColorStop(0, '#1d4173');

  skyContext.fillStyle = skyTop;
  skyContext.fillRect(0, 0, skyWidth, 10);
  skyContext.fillStyle = skyBottom;
  skyContext.fillRect(0, 10, skyWidth, 10);
  let image = new Image();
  image.src = skyCanvas.toDataURL();
  return image;
};

const getSkyData = (skyImage) => {
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = skyWidth;
  skyCanvas.height = skyHeight;
  const skyContext = skyCanvas.getContext("2d");
  skyContext.drawImage(skyImage, 0, 0);
  return skyContext.getImageData(0, 0, skyWidth, skyHeight).data;
};

const sketch = ({ context: ctx, width, height }) => {
  cx = width * 0.5;
  cy = height * 0.5;
  
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

    drawSky(ctx, ct, width, height);
    drawLight(ctx, ct);
    drawSea(ctx, ct);
    drawLand(ctx, ct, width, height);
    drawDebugData(ctx, ct, width, height);
  };
};

const skyImage = generateSkyImage();
const skyData = getSkyData(skyImage);
const drawSky = (ctx, time, width, height) => {
  ctx.save();
  ctx.translate(0, cy); // Horizont
  ctx.fillStyle = '#1d4173';
  ctx.fillRect(0, 0, width, -cy);
  
  const x = Math.round(math.mapRange(time, 0, params.timeLimit, 0, skyWidth));
  const shiftTop = x * 4;
  const shiftBottom = (skyWidth * 11 + x) * 4;

  const colorTop = `rgb(${skyData[shiftTop]}, ${skyData[shiftTop + 1]}, ${skyData[shiftTop + 2]})`;
  const colorBottom = `rgb(${skyData[shiftBottom]}, ${skyData[shiftBottom + 1]}, ${skyData[shiftBottom + 2]})`;

  const skyColor = ctx.createLinearGradient(0, 0, 0, -cy);
  skyColor.addColorStop(1, colorTop);
  skyColor.addColorStop(0, colorBottom);
  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, width, -cy);

  ctx.restore();
};

const drawLight = (ctx, time) => {
  const orbitRadius = 450;
  const objectRadius = 80;
  const angle = - math.mapRange(time, 0, params.timeLimit, 0, Math.PI * 2);
  // At time 0 and time max Moon at its zenith
  // At time max/2 - Sun at its zenith
  const moonx = cx + orbitRadius * Math.sin(angle + Math.PI);
  const moony = cy + orbitRadius * Math.cos(angle + Math.PI);
  const sunx = cx + orbitRadius * Math.sin(angle);
  const suny = cy + orbitRadius * Math.cos(angle);
  // Moon
  ctx.save();
  ctx.translate(moonx, moony);
  ctx.fillStyle = '#FEFCD7';
  ctx.beginPath();
  ctx.arc(0, 0, objectRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Sun
  ctx.save();
  ctx.translate(sunx, suny);
  const sunGrad = ctx.createLinearGradient(0, -objectRadius, 0, objectRadius);
  sunGrad.addColorStop(0, 'yellow');
  sunGrad.addColorStop(1, 'red');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(0, 0, objectRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawSea = (ctx, time) => {

};

const generateSkyline = (width, height) => {
  // Generate mountains
  let nodes = [[0.0, 0.0]];
  let stepsCount = random.range(10, 15);
  let step = width / (stepsCount + 2);
  for (let index = 1; index <= stepsCount; index++) {
    let x = step * index;
    // let y = random.noise1D(index); // get value
    let y = random.gaussian();
    y *= 85; // add amplitude
    y = y - (Math.sqrt(width * 0.5 * width * 0.5 - (x - width * 0.5) * (x - width * 0.5))) * 0.5; // correct height to be higher closer to center
    y = y * -Math.sign(y);
    nodes.push([x, y]);
  }
  nodes.push([width, 0.0]);
  return nodes;
};

const drawSkyline = (ctx, skyline) => {
  ctx.translate(0, skylineInterval);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 0; i < skyline.length; i++) {
    const element = skyline[i];
    ctx.lineTo(element[0], element[1]);
  }
  ctx.closePath();
  ctx.fill();
}

const drawLand = (ctx, time, width, height) => {
  let skylineGrad = ctx.createLinearGradient(0, 0, 0, -300);
  skylineGrad.addColorStop(0, '#bbd3de');
  skylineGrad.addColorStop(1, '#487da7');

  if (skylines.length == 0) {
    skylines = [...Array(10)].map(() => {
      return generateSkyline(width, height);
    });
  }
  skylineStep += 1;
  if (skylineStep >= skylineInterval) {
    skylines.unshift(generateSkyline(width, height));
    skylineStep = 0;
  }

  ctx.save();
  ctx.translate(0, cy);
  ctx.translate(0, -skylineStep);
  ctx.fillStyle = skylineGrad;
  let opacity = math.mapRange(skylineStep, 0, skylineInterval, 0, 1);
  ctx.globalAlpha = opacity;
  drawSkyline(ctx, skylines[0]);
  ctx.restore();


  ctx.save();
  ctx.translate(0, cy); // Horizont
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, width, cy);
  ctx.restore();

  ctx.save();
  ctx.translate(0, cy - skylineInterval);
  ctx.translate(0, skylineStep);
  ctx.fillStyle = skylineGrad;
  for (let sl = 1; sl < skylines.length; sl++) {
    ctx.globalAlpha = 1;
    const skyline = skylines[sl];
    drawSkyline(ctx, skyline);
    }
  ctx.restore();
};

const drawDebugData = (ctx, time, width, height) => {
  ctx.save();
  ctx.font = "30px Georgia";
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.fillText(`Time: ${Math.round(time)}`, 20, 30);
  ctx.fill();

  // ctx.strokeStyle = 'green';
  // ctx.lineWidth = 3;
  // ctx.moveTo(0, cy);
  // ctx.lineTo(width, cy);
  // ctx.moveTo(cx, 0);
  // ctx.lineTo(cx, height);
  // ctx.stroke();
  // ctx.restore();

  ctx.drawImage(skyImage, 10, 50);

  const x = Math.round(math.mapRange(time, 0, params.timeLimit, 0, skyWidth));
  const shiftTop = x * 4;
  const shiftBottom = (skyWidth * 11 + x) * 4;
  ctx.beginPath();
  ctx.strokeStyle = 'green';
  ctx.lineWidth = 3;
  ctx.rect(10 + x, 50, 5, 20);
  ctx.stroke();
};

const createPane = () => {
  const pane = new Tweakpane.Pane();
  let folder;

  folder = pane.addFolder({ title: 'Grid'});
  folder.addInput(params, 'time', { min: 0, max: params.timeLimit, step: 0.1});
  folder.addInput(params, 'timeAcceleration', { min: 0.01, max: 0.5, step: 0.01});
  folder.addInput(params, 'timeLimit', { min: 10, max: 50, step: 1});
  folder.addInput(params, 'animate');
}

createPane();
canvasSketch(sketch, settings);
