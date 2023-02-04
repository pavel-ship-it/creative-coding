const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const lightColor = 'white';
const darkColor = 'black';

// Neural decay
const sketch = ({ context, width, height }) => {
    const agentsCount = 50;
    const agents = [];

    for (var i = 0; i < agentsCount; i++) {
      const x = random.range(0, width);
      const y = random.range(0, height);
      agents.push(new Agent(x, y));
    }

  return ({ context, width, height }) => {
    context.fillStyle = lightColor;
    context.fillRect(0, 0, width, height);

    for (var i = 0; i < agents.length; i++) {
      const agent = agents[i];

      for (var j = i + 1; j < agents.length; j++) {
        const other = agents[j];

        const distance = agent.pos.distance(other.pos);

        if (distance > 200) {
          continue;
        }

        context.lineWidth = math.mapRange(distance, 0, 200, 12, 1);

        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        context.stroke();
      }
    }

    agents.forEach(agent => {
      agent.update();
      agent.draw(context);
      // agent.bounce(width, height);
      agent.wrap(width, height);
    });
  };
};

canvasSketch(sketch, settings);

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Agent {
  constructor(x, y) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.radius = random.range(4, 12);
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

  draw(context) {
    // context.fillStyle = darkColor;

    context.save();
    context.translate(this.pos.x, this.pos.y);

    context.lineWidth = 4;

    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.restore();
  }

  bounce(width, height) {
    if (this.pos.x - this.radius <= 0 || this.pos.x  + this.radius >= width) this.vel.x *= -1;
    if (this.pos.y - this.radius <= 0 || this.pos.y + this.radius >= height) this.vel.y *= -1;
  }

  wrap(width, height) {
    if (this.pos.x < 0 - this.radius) this.pos.x = width + this.radius - 1;
    if (this.pos.x > width + this.radius) this.pos.x = 0 - this.radius + 1;
    if (this.pos.y < 0 - this.radius) this.pos.y = height + this.radius - 1;
    if (this.pos.y > height + this.radius) this.pos.y = 0 - this.radius + 1;
  }
}