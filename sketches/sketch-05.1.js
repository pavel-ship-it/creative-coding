const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: 'true',
};

const params = {
  foreground: 'white',
  background: 'black',
}

let manager;
let image;
let text = 'A';
let fontSize = 500;
let fontFamily = 'serif';

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {

  const cell = 10;
  const cols = Math.floor(width/cell);
  const rows = Math.floor(height/cell);
  const numCells = cols * rows;
  
  typeCanvas.width = cols;
  typeCanvas.height = rows;

  return ({ context, width, height }) => {
    typeContext.fillStyle = params.background;
    typeContext.fillRect(0, 0, cols, rows);

    typeContext.fillStyle = params.foreground;

    typeContext.save();
    typeContext.drawImage(image, 0, 0, 200, 200, 0, 0, cols, rows);
    typeContext.restore();

    const typeData = typeContext.getImageData(0, 0, cols, rows).data;

    context.fillStyle = params.background;
    context.fillRect(0, 0, width, height);

    for (var i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4]; // red channel

      context.fillStyle = 'white';
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

    context.drawImage(image, 0, 0, 200, 200, 0, 0, cols, rows);
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

const url = 'https://picsum.photos/200';

const loadImage = (size) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject();
    image.crossOrigin = "Anonymous";
    image.src = url;
  });
};

const start = async () => {
  image = await loadImage();
  manager = await canvasSketch(sketch, settings);
};

start();