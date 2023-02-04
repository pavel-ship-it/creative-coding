const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: 'true',
  fps: 30
};

const background = 'white';
const foreground = 'black';

// Time's running up animation
const sketch = ({ context, width, height }) => {

  const center = new Vector(width * 0.5, height * 0.5);
  const radius = width * 0.3;
  const notchesCount = 12;
  const notches = [];
  const arcs = [];
  const w = width * 0.01;
  const h = height * 0.1;

  for (var i = 0; i < notchesCount; i++) {
    const slice = math.degToRad(360 / notchesCount);
    const angle = slice * i;

    const position = new Vector(center.x + radius * Math.sin(angle),
                                center.y + radius * Math.cos(angle));
    const x = center.x + radius * Math.sin(angle);
    const y = center.y + radius * Math.cos(angle);
    const scale = new Vector(random.range(0.1, 2), random.range(0.2, 0.5));

    notches.push(new Notch(w, h, position, scale, angle));
    notches.push(new Arc(center,
                      angle,
                      radius * random.range(0.7, 1.3),
                      slice * random.range(1, -8),
                      slice * random.range(1, 5)));
  }
  notches.push(new Arrow(center, 20, 100, random.range(-0.01, 0.01)));
  notches.push(new Arrow(center, 30, 300, random.range(-0.1, 0.1)));

  return ({ context, width, height }) => {

    context.fillStyle = background;
    context.strokeStyle = foreground;

    context.fillRect(0, 0, width, height);

    for (var i = notches.length - 1; i >= 0; i--) {
      notches[i].draw(context);
      notches[i].update();
    }
  };
};

canvasSketch(sketch, settings);

class Vector  {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Arrow {
  constructor(position, width, length, rotSpeed) {
    this.position = position;
    this.length = length;
    this.width = width;
    this.rotSpeed = rotSpeed;
    this.angle = random.range(0, Math.PI * 2);
  }

  draw(context) {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(-this.angle);
    context.translate(-this.width * 0.5, 0);
    context.beginPath();
    context.rect(0, 0, this.width, this.length);
    context.fillStyle = foreground;
    context.fill();
    context.restore();
  }

  update() {
    this.angle += this.rotSpeed;
  }
}

class Notch {
  constructor(w, h, position, scale, rotation) {
    this.w = w;
    this.h = h;
    this.position = position;
    this.scale = scale;
    this.rotation = rotation;
    this.anglette = random.range(0, Math.PI * 2);
    this.speed = random.range(1, Math.PI * 2) * 0.02;
  }

  draw(context) {
      context.save();
      context.translate(this.position.x, this.position.y);
      const oscRadius = 5;
      const position = new Vector(oscRadius * Math.sin(this.anglette), oscRadius * Math.cos(this.anglette));
      context.translate(position.x, position.y);

      context.rotate(-this.rotation);
      context.scale(this.scale.x, this.scale.y);

      context.beginPath();
      context.rect(-this.w * 0.5, -this.h * 0.5, this.w, this.h)
      context.fillStyle = foreground;
      context.fill();
      context.restore();
  }

  update() {
    this.anglette += this.speed;
    this.anglette = math.wrap(this.anglette, 0, Math.PI * 2);
  }
}

class Arc {
  constructor(center, angle, radius, from, to) {
    this.center = center;
    this.angle = angle;
    this.radius = radius;
    this.from = from;
    this.to = to;
    this.lineWidth = random.range(5, 20);
    this.anglette = 0;
    this.originalA = 0;
    this.speed = random.range(-0.05, 0.05);
  }

  draw(context) {
    context.save();
    context.translate(this.center.x, this.center.y);
    context.rotate(-this.angle);

    context.lineWidth = this.lineWidth;

    context.beginPath();
    context.arc(0, 0, this.radius, this.from + this.anglette, this.to + this.anglette);
    context.stroke();

    context.restore();
  }

  update() {
    this.anglette += this.speed;
    if (this.anglette < this.originalA - Math.PI / 4) {
      this.anglette = this.originalA - Math.PI / 4
      this.speed = random.range(-0.05, 0.05) * -(Math.sign(this.speed));
    } else if (this.anglette > this.originalA + Math.PI / 4) {
      this.anglette = this.originalA + Math.PI / 4;
      this.speed = random.range(-0.05, 0.05) * -(Math.sign(this.speed));
    }
  }
}