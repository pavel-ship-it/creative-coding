const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: 'true',
};

const params = {
  time: 0,
  timeAcceleration: 0.05,
  timeLimit: 20,
  animate: true,
};

let cx = 0;
let cy = 0;
let ct = 0;

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
    drawLand(ctx, ct);
    drawDebugData(ctx, ct, width, height);
  };
};

const drawSky = (ctx, time, width, height) => {
  ctx.save();
  ctx.translate(0, cy); // Horizont
  // ctx.fillStyle = '#FEFCD7';
  const skyGrad = ctx.createLinearGradient(0, 0, 0, -cy);
  skyGrad.addColorStop(0, 'blue');
  skyGrad.addColorStop(1, 'black');
  ctx.fillStyle = skyGrad;
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

const drawLand = (ctx, time) => {

};

const drawDebugData = (ctx, time, width, height) => {
  ctx.save();
  ctx.font = "30px Georgia";
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.fillText(`Time: ${Math.round(time)}`, 20, 30);
  ctx.fill();

  ctx.strokeStyle = 'green';
  ctx.lineWidth = 3;
  ctx.moveTo(0, cy);
  ctx.lineTo(width, cy);
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, height);
  ctx.stroke();
  ctx.restore();
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
