// Bauhaus
const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: 'true',
};

const params = {
  cols: 6,
  rows: 8,
  foreground: '#D46936',
  background: '#DBD6BC',
};

const units = [];

const sketch = () => {

  const cellsCount = params.cols * params.rows;

  for (var i = 0; i < cellsCount; i++) {
    const col = i % params.cols;
    const row = Math.floor(i / params.cols);
    const orientation = !Math.round(Math.random());
    units.push(new Unit(col, row, orientation));
  }

  return ({ context, width, height }) => {
    context.fillStyle = params.background;
    context.fillRect(0, 0, width, height);

    const w = width * 0.8;
    const h = height * 0.8;
    const unitSize = w / params.cols <= h / params.rows ? w / params.cols : h / params.rows;
    const marginw = (width - unitSize * params.cols) * 0.5;
    const marginh = (height - unitSize * params.rows) * 0.5;
    
    context.translate(marginw, marginh);

    units.forEach(unit => {
      unit.draw(context, unitSize);
      unit.update();
    });
  };
};

canvasSketch(sketch, settings);

class Unit {
  constructor(col, row, orientation) {
    this.col = col;
    this.row = row;
    this.orientation = orientation;
    this.pauseDuration = random.range(1000, 5000);
    this.isPausing = true;
    this.lastUpdate = Date.now();
    this.angle = 0;
    this.direction = !Math.round(Math.random()) ? 1 : -1;
  }

  draw(ctx, unitSize) {
      const x = this.col * unitSize;
      const y = this.row * unitSize;

      ctx.save();
      ctx.fillColor = params.foreground;
      ctx.fillStyle = params.foreground;
      ctx.translate(x, y);
      ctx.translate(unitSize * 0.5, unitSize * 0.5);

      if (this.orientation) {
        ctx.rotate(Math.PI * 0.5);
      }
      if (!this.isPausing) {
        ctx.rotate(this.angle);
      }

      ctx.save();
      ctx.translate(0, unitSize * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, unitSize * 0.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(0, unitSize * -0.5);
      ctx.beginPath();
      ctx.arc(0, 0, unitSize * 0.5, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
  }

  update() {
    if (this.isPausing && Date.now() - this.lastUpdate >= this.pauseDuration) {
    this.isPausing = !this.isPausing;
    this.lastUpdate = Date.now();
    }
    if (!this.isPausing) {
      this.angle += 0.03 * this.direction;
      if (this.angle * this.direction >= Math.PI * 0.5) {
        this.angle = 0;
        this.orientation = !this.orientation;
        this.isPausing = !this.isPausing;
        this.lastUpdate = Date.now();
        this.direction = !Math.round(Math.random()) ? 1 : -1;
        this.pauseDuration = random.range(3000, 10000);
      }
    }
  }
}