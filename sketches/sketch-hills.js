// Hills
const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

let nextColor = random.pick(['#B2D5B0', '#81B67E', '#579854', '#3A7E37', '#21661D',]);

function generateLine(width, height, linesCount) {
  let horizontalShift = random.range(-width * 0.05, width * 0.05);
  let lineStart = { x: width * -0.1 + horizontalShift, y: 0 };
  let lineEnd = { x: width * 1.1 + horizontalShift, y: 0 };
  let segs = random.rangeFloor(5, 10);
  let angles = [];
  let upOrDown = random.pick([1, -1]);
  for (let i = 0; i < segs; i++) {
    // angle of the curve changes direction every other segment
    angles.push(((i % 2 === 0) ? upOrDown : -upOrDown) * random.range(Math.PI * 0.25, Math.PI * 0.45));
  }
  //amplitude of the curve
  let offsets = [];
  for (let i = 0; i < segs; i++) {
    // offset is random between 20-90% of the distance between the points
    offsets.push(width * 1.2 * random.range(0.3, 0.9) / segs);
  }
  let color = nextColor;
  nextColor = random.pick(['#B2D5B0', '#81B67E', '#579854', '#3A7E37', '#21661D',]);
  return { lineStart, lineEnd, segs, angles, offsets, color };
}

// Besier curve with symmetric normalized angle
const sketchBesierAngles = ({ context, width, height }) => {
  // Generate lines
  let linesCount = 15;
  let linesData = [];
  for (let y = 0; y < linesCount; y++) {
    linesData.push(generateLine(width, height, linesCount));
  }
  
  let shift = 0; // How much the lines have scrolled
  return ({ context, width, height, frame }) => {
    context.fillStyle = nextColor;
    context.fillRect(0, 0, width, height);

    shift += 1.6; // Scroll speed
    // When the line is out of the screen, generate a new one
    if (shift >= height * 1.4 / linesCount) {
      linesData.pop();
      linesData.unshift(generateLine(width, height, linesCount));
      shift = 0;
    }

    // Draw lines
    for (let l=0; l<linesData.length; l++) {
      let { lineStart, lineEnd, segs, angles, offsets, color } = linesData[l];
      // shift the line vertically
      // bigger value means more space between lines
      let lineShift = shift + l * height * 1.4 / linesCount - height * 0.2;

      // draw spline using bezier curves
      // use offsets and angles to control the curve
      for (let i = 0; i < segs; i++) {
        context.save();
        context.beginPath();
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        for (let i = 0; i < segs; i++) {
          let angle = angles[i] - Math.PI;
          let offset = offsets[i];
          let x = lineStart.x + (lineEnd.x - lineStart.x) * (i / (segs - 1)); 
          let y = lineStart.y + (lineEnd.y - lineStart.y) * (i / (segs - 1)) + lineShift;
          let dx = Math.cos(angle) * offset;
          let dy = Math.sin(angle) * offset;
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            let prevAngle = angles[i-1] - Math.PI;
            let prevOffset = offsets[i-1];
            let prevX = lineStart.x + (lineEnd.x - lineStart.x) * ((i - 1) / (segs - 1));
            let prevY = lineStart.y + (lineEnd.y - lineStart.y) * ((i - 1) / (segs - 1)) + lineShift;
            let prevDx = Math.cos(prevAngle) * prevOffset;
            let prevDy = Math.sin(prevAngle) * prevOffset;
            let cp1x = prevX - prevDx;
            let cp1y = prevY - prevDy;
            let cp2x = x + dx;
            let cp2y = y + dy;
            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          }
        }
        if (true) {
          // close curve to fill the area
          context.lineTo(lineEnd.x, lineEnd.y + 400 + lineShift);
          context.lineTo(lineStart.x, lineEnd.y + 400 + lineShift);
          context.closePath();
          context.fillStyle = color;
          context.lineCap = 'round';
          context.fill();
        }
        context.stroke();
        context.restore();
      }
      // draw guides
      if (false) {
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        for (let i = 1; i < segs; i++) {
          let angle = angles[i];
          let offset = offsets[i];
          let x = lineStart.x + (lineEnd.x - lineStart.x) * (i / (segs - 1));
          let y = lineStart.y + (lineEnd.y - lineStart.y) * (i / (segs - 1)) + lineShift;
          let prevAngle = angles[i] - Math.PI;
          let prevOffset = offsets[i];
  
          context.save();
          context.fillStyle = "blue";
          context.beginPath();
          context.arc(x, y, 5, 0, 2 * Math.PI);
          context.fill();

          context.beginPath();
          context.strokeStyle = "red";
          context.moveTo(x, y);
          context.lineTo(x + Math.cos(angle) * offset, y + Math.sin(angle) * offset);
          context.stroke();

          context.beginPath();
          context.strokeStyle = "green";
          context.moveTo(x, y);
          context.lineTo(x + Math.cos(prevAngle) * prevOffset, y + Math.sin(prevAngle) * prevOffset);
          context.stroke();
          context.restore();
        }
      }
    }
  };
};

canvasSketch(sketchBesierAngles, settings);
