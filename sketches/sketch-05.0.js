const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: 'true',
  // fps: 30,
};

const params = {
  foreground: 'white',
  background: 'black',
}

let manager;
let text = 'LET THERE BE LIGHT';
let fontSize = 500;
let fontFamily = 'serif';

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d', { willReadFrequently: true });

const sketch = ({ context, width, height, frame }) => {

  const cell = 10;
  const cols = Math.floor(width/cell);
  const rows = Math.floor(height/cell);
  const numCells = cols * rows;
  
  typeCanvas.width = cols;
  typeCanvas.height = rows;

  return ({ context, width, height, frame }) => {
    const metrics = typeContext.measureText(text);
    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const fullFrame = 300 + cols + metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight + cols;
    const frameShift = -(frame * 5) % fullFrame;

    context.fillStyle = params.background;
    context.fillRect(0, 0, width, height);
    typeContext.fillStyle = params.background;
    typeContext.fillRect(0, 0, cols, rows);
    // if (frame < 50) {
    //   return;
    // }

    fontSize = cols * 1.2;

    typeContext.fillStyle = params.foreground;
    typeContext.font = `${fontSize}px ${fontFamily}`;
    typeContext.textBaseline = 'top';

    const tx = frameShift + cols;
    const ty = (rows - mh) * 0.5 - my;

    typeContext.save();
    typeContext.translate(tx, ty);
    typeContext.fillText(text, 0, 0);
    typeContext.restore();

    const typeData = typeContext.getImageData(0, 0, cols, rows).data;

    context.fillStyle = params.background;
    context.fillRect(0, 0, width, height);

    context.textBaseline = 'middle';
    context.textAlign = 'center';

    for (var i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4]; // red channel

      // context.fillStyle = 'white';
      context.fillStyle = random.pick(['white', 'red', 'green', 'blue']);

      context.font = `${cell * 2}px ${fontFamily}`;
      if (Math.random() < 0.1) {
        context.font = `${cell * 6}px ${fontFamily}`;
      }

      const glyph = getGlyph(r);

      context.save();
      context.translate(x, y);
      context.translate(cell *0.5, cell*0.5);

      context.beginPath();
      context.fillText(glyph, 0, 0);
      context.fill();
      context.restore();
    }
  };
};

const getGlyph = (v) => {
  if (v < 50) return '';
  if (v < 100) return '.';
  if (v < 150) return '-';
  if (v < 200) return '+';
  const glyphs = '_=/'.split('');
  return random.pick(glyphs);
};

// const onKeyUp = (e) => {
//   text = e.key;
//   manager.render(); 
// };

// document.addEventListener('keyup', onKeyUp);

const start = async () => {
  manager = await canvasSketch(sketch, settings);
};

start();