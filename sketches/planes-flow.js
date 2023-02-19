// Algorithm for simulating a murmuration of paper planes:
// Initialize a set of paper planes with random positions and velocities.
// For each time step:
// a. Update the position of each paper plane based on its current velocity.
// b. Calculate the average velocity of all neighboring paper planes within a certain radius. This radius can be adjusted to control the density of the flock.
// c. Update the velocity of each paper plane based on its current velocity and the average velocity of its neighbors. This update can be scaled by a weight factor to control the strength of the flocking behavior.
// d. Add some randomness to the velocity of each paper plane to simulate natural variations in movement.
// Render the paper planes as a visual representation, such as a series of dots or small triangles.
// Repeat from step 2 until the desired duration of the simulation is reached.

// A boundary check:
// Define the boundaries of the simulation area with a circle from the centre of canvas.
// For each time step:
// a. Check if the position of each paper plane is outside the boundaries of the simulation area. If so, calculate the distance and direction to the center of the simulation area.
// b. Apply a force to the paper plane to steer it back towards the center of the simulation area. This force can be proportional to the distance from the center, or it can be a fixed force that is applied whenever the plane crosses the boundary.
// c. Update the velocity of each paper plane based on the forces applied to it.
// Render the paper planes as before.
// Repeat from step 2 until the desired duration of the simulation is reached.

// Tail will be drawn using the history of plane positions
// The tail will be drawn as a series of small circles, with the most recent positions drawn as larger circles.

const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const size = 1080;
const settings = {
  dimensions: [ size, size ],
  animate: 'true',
};

const numPlanes = 300;
const planeSize = 7;
const firstTailDistance = 1.7;
const allowedRadius = 300;

// Initialize a set of paper planes with random positions and velocities.
const planes = [];
for (let i = 0; i < numPlanes; i++) {
  planes.push({
    x: random.range(size / 2 - allowedRadius, size / 2 + allowedRadius),
    y: random.range(size / 2 - allowedRadius, size / 2 + allowedRadius),
    vx: random.range(-1, 1),
    vy: random.range(-1, 1),
    // Choose one of complimentary colors for each plane
    color: random.pick(['#00BFB2', '#FF5349', '#FFA933', '#8CC63E', '#8B2A7E']),
    tail: []
  });
}

const sketch = ({ context, width, height }) => {
  // Define the boundaries of the simulation area with a circle from the centre of canvas.
  const centerX = width / 2;
  const centerY = height / 2;
  let counter = 0;
  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    // Pause before animation starts
    if (counter < 100) {
      counter++;
      return;
    }

    // For each time step:
    // a. Update the position of each paper plane based on its current velocity.
    planes.forEach((plane) => {
      plane.tail.unshift({ x: plane.x, y: plane.y });
      plane.x += plane.vx;
      plane.y += plane.vy;
    });
    // b. Calculate the average velocity of all neighboring paper planes within a certain radius.
    // This radius can be adjusted to control the density of the flock.
    const radius = 20;
    const velocities = [];
    planes.forEach((plane) => {
      let sumVx = 0;
      let sumVy = 0;
      let numNeighbors = 0;
      planes.forEach((otherPlane) => {
        const dx = plane.x - otherPlane.x;
        const dy = plane.y - otherPlane.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
          sumVx += otherPlane.vx;
          sumVy += otherPlane.vy;
          numNeighbors++;
        }
      });
      const avgVx = sumVx / numNeighbors;
      const avgVy = sumVy / numNeighbors;
      // c. Update the velocity of each paper plane based on its current velocity and the average velocity of its neighbors.
      // This update can be scaled by a weight factor to control the strength of the flocking behavior.
      const weight = 0.1;
      velocities.push({
        vx: plane.vx + weight * (avgVx - plane.vx),
        vy: plane.vy + weight * (avgVy - plane.vy)
      });
    });
    // d. Add some randomness to the velocity of each paper plane to simulate natural variations in movement.
    planes.forEach((plane, i) => {
      plane.vx = velocities[i].vx + random.range(-0.1, 0.1);
      plane.vy = velocities[i].vy + random.range(-0.1, 0.1);
      // Render the paper planes as a visual representation, such as a series of dots or small triangles.
      drawPlane(context, plane);
      // A boundary check:
      // a. Check if the position of each paper plane is outside the boundaries of the simulation area.
      // If so, calculate the distance and direction to the center of the simulation area.
      const dx = plane.x - centerX;
      const dy = plane.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > allowedRadius) {
        // b. Apply a force to the paper plane to steer it back towards the center of the simulation area.
        // This force can be proportional to the distance from the center, or it can be a fixed force that is applied whenever the plane crosses the boundary.
        const force = 0.005;
        const vx = force * (centerX - plane.x);
        const vy = force * (centerY - plane.y);
        // c. Update the velocity of each paper plane based on the forces applied to it.
        plane.vx += vx;
        plane.vy += vy;
      }
    });
  };
};

canvasSketch(sketch, settings);

// Draw s little triangle of the plane
function drawPlane(context, plane) {
  context.save();
  context.fillStyle = plane.color;
  context.translate(plane.x, plane.y);
  context.rotate(Math.atan2(plane.vy, plane.vx));
  context.beginPath();
  context.moveTo(0, 0);
  // Rotate using the velocity of the plane
  context.lineTo(-planeSize, planeSize / 3);
  context.lineTo(-planeSize, -planeSize / 3);
  context.closePath();
  context.fill();
  context.restore();

  // Draw tail enumerate points in the tail, skipping 9 out of 10 points draw circles.
  let lastPoint = plane.tail[0];
  let limitIndex = plane.tail.length;
  let tailLength = 0;
  let drawnPoints = 0;
  for (let i = 0; i < plane.tail.length; i++) {
    // if distance between last point and current point is too small, skip it
    const dx = plane.tail[i].x - lastPoint.x;
    const dy = plane.tail[i].y - lastPoint.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if ((drawnPoints == 0 && dist < planeSize * firstTailDistance) || dist < planeSize) {
      continue;
    }
    tailLength += dist;
    drawnPoints++;
    if (tailLength > 30 || drawnPoints >= 4) {
      limitIndex = i;
      break;
    }
    lastPoint = plane.tail[i];
    context.save();
    context.fillStyle = plane.color;
    context.beginPath();
    context.arc(plane.tail[i].x, plane.tail[i].y, 2 - drawnPoints * 0.5, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
  // delete tail points after limitIndex
  plane.tail = plane.tail.slice(0, limitIndex);
}