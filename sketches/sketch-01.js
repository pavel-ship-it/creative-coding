const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
  // dimentions: 'A4',
  // pixelsPerInch: 300,
  // orientation: 'landscape'
};

// Squares on squares in squares

const sketch = () => {
  return ({ context, width, height }) => {
    if (0==1) {
      context.fillStyle = 'white';
      context.strokeStyle = 'black';
    } else {
      context.fillStyle = 'black';
      context.strokeStyle = 'white';
    }

    context.fillRect(0, 0, width, height);
    context.lineWidth = width * 0.01;

    const W = width * 0.1;
    const L = height * 0.1;
    const gap = width * 0.03;
    const ix = width * 0.17;
    const iy = height * 0.17;
    const offset = width * 0.02;
    let x, y;

    for (let i = 0; i< 5; i++) {
      for (let j = 0; j< 5; j++) {
        x = ix + (W + gap) * i;
        y = iy + (L + gap) * j;

        context.beginPath();
        context.rect(x, y, W, L);
        context.stroke();

        if (Math.random() >= 0.5) {
          context.beginPath();
          context.rect(x + offset/2, y + offset/2, W - offset, L - offset);
          context.stroke();      
        }
      }
    }
  };
};

canvasSketch(sketch, settings);