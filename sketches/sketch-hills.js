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
    offsets.push(width * 1.2 * random.range(0.2, 0.9) / segs);
  }
  let color = nextColor;
  nextColor = random.pick(['#B2D5B0', '#81B67E', '#579854', '#3A7E37', '#21661D',]);
  return { lineStart, lineEnd, segs, angles, offsets, color };
}

// Besier curve with symmetric normalized angle
const sketchBesierAnglesSym = ({ context, width, height }) => {
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
            // angle and offset are same as previous segment
            // but mirrored to archieve symmetric curve
            let prevAngle = Math.PI - angle;
            let prevOffset = -offset;
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
        // close curve to fill the area
        context.lineTo(lineEnd.x, lineEnd.y + 400 + lineShift);
        context.lineTo(lineStart.x, lineEnd.y + 400 + lineShift);
        context.closePath();
        context.fillStyle = color;
        context.lineCap = 'round';
        context.stroke();
        context.fill();
        context.restore();
      }
      // draw guides
      if (false) {
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        for (let i = 0; i < segs-1; i++) {
          let angle = angles[i] - Math.PI;
          let offset = offsets[i];
          let x = lineStart.x + (lineEnd.x - lineStart.x) * (i / (segs - 1));
          let y = lineStart.y + (lineEnd.y - lineStart.y) * (i / (segs - 1)) + lineShift;
          let prevAngle = Math.PI - angles[i+1];
          let prevOffset = -offsets[i+1];
  
          context.save();
          context.fillStyle = "blue";
          context.beginPath();
          context.arc(x, y, 5, 0, 2 * Math.PI);
          context.fill();

          context.beginPath();
          context.strokeStyle = "red";
          context.moveTo(x, y);
          context.lineTo(x + Math.cos(prevAngle) * prevOffset, y + Math.sin(prevAngle) * prevOffset);
          context.stroke();

          context.beginPath();
          context.strokeStyle = "green";
          context.moveTo(x, y);
          context.lineTo(x + Math.cos(angle) * offset, y + Math.sin(angle) * offset);
          context.stroke();
          context.restore();
        }
      }
    }
  };
};

// Besier curve with normalized angle
const sketchBesierAngles = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    // Generate lines
    let linesCount = 10;
    let linesData = [];
    for (let y = 0; y < linesCount; y++) {
      // first point
      let lineStart = { x: width * 0.1, y: height * 0.1 + (height * 0.8) * (y / linesCount) };
      // last point
      let lineEnd = { x: width * 0.9, y: height * 0.1 + (height * 0.8) * (y / linesCount) };
      let segs = random.rangeFloor(5, 10);
      let angles = [];
        for (let i = 0; i < segs; i++) {
        // angles.push(random.range(Math.PI * -0.25, Math.PI * 0.25));
        angles.push(random.pick([1, -1]) * random.range(Math.PI * 0.25, Math.PI * 0.45));
      }
      //amplitude of the curve
      let offsets = [];
      for (let i = 0; i < segs; i++) {
        offsets.push(random.range(20, 80));
      }
      linesData.push({ lineStart, lineEnd, segs, angles, offsets });
      console.log({ lineStart, lineEnd, segs, angles, offsets });
    }

    for (let line of linesData) {
      let { lineStart, lineEnd, segs, angles, offsets } = line;
      // draw spline using bezier curves
      // use offsets and angles to control the curve
      context.strokeStyle = 'black';
      context.lineWidth = 1;
      for (let i = 0; i < segs; i++) {
        let angle = angles[i];
        // let reverseAngle = Math.PI - angle;
        let reverseAngle = angle - Math.PI;
        let offset = offsets[i];
        let x = lineStart.x + (lineEnd.x - lineStart.x) * (i / (segs - 1));
        let y = lineStart.y + (lineEnd.y - lineStart.y) * (i / (segs - 1));
        context.save();
        context.fillStyle = "blue";
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();
        context.restore();

        context.save();
        context.beginPath();
        context.strokeStyle = "red";
        context.moveTo(x, y);
        context.lineTo(x + Math.cos(angle) * offset, y + Math.sin(angle) * offset);
        context.stroke();
        context.restore();

        context.save();
        context.beginPath();
        context.strokeStyle = "green";
        context.moveTo(x, y);
        context.lineTo(x + Math.cos(reverseAngle) * offset, y + Math.sin(reverseAngle) * offset);
        context.stroke();
        context.restore();
      }

      // draw spline using bezier curves
      // use offsets and angles to control the curve
      for (let i = 0; i < segs; i++) {
        context.save();
        context.beginPath();
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        for (let i = 0; i < segs; i++) {
          // let angle = angles[i];
          let angle = angles[i] - Math.PI;
          let offset = offsets[i];
          let x = lineStart.x + (lineEnd.x - lineStart.x) * (i / (segs - 1)); 
          let y = lineStart.y + (lineEnd.y - lineStart.y) * (i / (segs - 1));
          let dx = Math.cos(angle) * offset;
          let dy = Math.sin(angle) * offset;
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            // let prevAngle = angle - Math.PI;
            // let prevAngle = Math.PI - angles[i];
            let prevAngle = angles[i - 1] - Math.PI;
            let prevOffset = offsets[i - 1];
            let prevX = lineStart.x + (lineEnd.x - lineStart.x) * ((i - 1) / (segs - 1));
            let prevY = lineStart.y + (lineEnd.y - lineStart.y) * ((i - 1) / (segs - 1));
            let prevDx = Math.cos(prevAngle) * prevOffset;
            let prevDy = Math.sin(prevAngle) * prevOffset;
            let cp1x = prevX - prevDx;
            let cp1y = prevY - prevDy;
            let cp2x = x + dx;
            let cp2y = y + dy;
            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          }
        }
        context.stroke();
        context.restore();
      }
    }
  };
};

// Besier curve
const sketchBesier = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let linesCount = 10;
    for (let y = 0; y < linesCount; y++) {
      let a = { x: width * 0.1, y: height * 0.1 + (height * 0.8) * (y / linesCount) };
      let b = { x: width * 0.9, y: height * 0.1 + (height * 0.8) * (y / linesCount) };
      let segs = random.rangeFloor(5, 10);
      let angles = [];
      for (let i = 0; i < segs; i++) {
        angles.push(random.range(Math.PI * -0.25, Math.PI * 0.25));
        // angles.push(-Math.PI/4);
      }
      let offsets = [];
      for (let i = 0; i < segs; i++) {
        offsets.push(random.range(20, 40));
      }

      // draw spline using bezier curves
      // use offsets and angles to control the curve
      context.save();
      context.beginPath();
      context.strokeStyle = 'black';
      context.lineWidth = 1;
      for (let i = 0; i < segs; i++) {
        let angle = angles[i];
        let offset = offsets[i];
        let x = a.x + (b.x - a.x) * (i / segs); 
        let y = a.y + (b.y - a.y) * (i / segs);
        let dx = Math.cos(angle) * offset;
        let dy = Math.sin(angle) * offset;
        if (i === 0) {
          context.moveTo(x + dx, y + dy);
        } else {
          let prevAngle = angles[i - 1];
          let prevOffset = offsets[i - 1];
          let prevX = a.x + (b.x - a.x) * ((i - 1) / segs);
          let prevY = a.y + (b.y - a.y) * ((i - 1) / segs);
          let prevDx = Math.cos(prevAngle) * prevOffset;
          let prevDy = Math.sin(prevAngle) * prevOffset;
          let cp1x = prevX - prevDx;
          let cp1y = prevY - prevDy;
          let cp2x = x + dx;
          let cp2y = y + dy;
          context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }
      }
      context.stroke();
      context.restore();
      for (let i = 0; i < segs; i++) {
        let angle = angles[i];
        let offset = offsets[i];
        let x = a.x + (b.x - a.x) * (i / segs); 
        let y = a.y + (b.y - a.y) * (i / segs);
        let dx = Math.cos(angle) * offset;
        let dy = Math.sin(angle) * offset;

        let prevAngle = angles[i - 1];
        let prevOffset = offsets[i - 1];
        let prevX = a.x + (b.x - a.x) * ((i - 1) / segs);
        let prevY = a.y + (b.y - a.y) * ((i - 1) / segs);
        let prevDx = Math.cos(prevAngle) * prevOffset;
        let prevDy = Math.sin(prevAngle) * prevOffset;
        let cp1x = prevX - prevDx;
        let cp1y = prevY - prevDy;
        let cp2x = x + dx;
        let cp2y = y + dy;

        // Start and end points
        context.fillStyle = "blue";
        context.beginPath();
        context.arc(prevX, prevY, 5, 0, 2 * Math.PI); // Start point
        context.arc(x, y, 5, 0, 2 * Math.PI); // End point
        context.fill();

        // Control points
        context.fillStyle = "red";
        context.beginPath();
        context.arc(cp1x, cp1y, 5, 0, 2 * Math.PI); // Control point one
        context.arc(cp2x, cp2y, 5, 0, 2 * Math.PI); // Control point two
        context.fill();
      }
      // context.save();
      // context.beginPath();
      // context.strokeStyle = 'black';
      // context.lineWidth = 1;
      // for (let i = 0; i < segs; i++) {
      //   let angle = angles[i];
      //   let offset = offsets[i];
      //   let x = a.x + (b.x - a.x) * (i / segs);
      //   let y = a.y + (b.y - a.y) * (i / segs);
      //   let dx = Math.cos(angle) * offset;
      //   let dy = Math.sin(angle) * offset;
      //   if (i === 0) {
      //     context.moveTo(x + dx, y + dy);
      //   } else {
      //     context.lineTo(x + dx, y + dy);
      //   }
      // }
      // context.lineTo(b.x, b.y);
      // context.stroke();
      // context.restore();
    }
  };
};

const sketchNoise = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);  
    const cols = 50;
    const rows = 50;
    const cellsNum = cols * rows;

    const gridW = width * 0.8;
    const gridH = height * 0.8;

    const cellW = gridW / cols;
    const cellH = gridH / rows;
    const margX = (width - gridW) * 0.5;
    const margY = (height - gridH) * 0.5;

    for (var i = 0; i < cellsNum; i++) {
      const col = i % cols;
      const row = Math.floor(i/cols);

      const x = col * cellW;
      const y = row * cellH;

      let w = cellW * 0.8;
      let h = cellH * 0.8;

      const f = params.animate ? frame : params.frame;
      const n = random.noise3D(x, y, f * 10, 0.01);
      const angle = n * Math.PI * 0.9;
      const scale = math.mapRange(n, -1, 1, 1, 30);

      context.save();

      context.translate(margX, margY);
      context.translate(x, y);
      context.translate(cellW * 0.5, cellH * 0.5);
      context.rotate(angle);

      context.lineWidth = scale;
      context.lineCap = 'butt';

      context.beginPath();
      context.moveTo(w * -0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.stroke();

      context.restore();

    }
  };
};

// canvasSketch(sketchNoise, settings);
// canvasSketch(sketchBesier, settings);
// canvasSketch(sketchBesierAngles, settings);
canvasSketch(sketchBesierAnglesSym, settings);
