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

const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: 'true',
};

// Initialize a set of paper planes with random positions and velocities.
const numPlanes = 1000;
const planes = [];
for (let i = 0; i < numPlanes; i++) {
  planes.push({
    x: random.range(300, 700),
    y: random.range(300, 700),
    vx: random.range(-1, 1),
    vy: random.range(-1, 1)
  });
}

const sketch = ({ context, width, height }) => {
  // Define the boundaries of the simulation area with a circle from the centre of canvas.
  const centerX = width / 2;
  const centerY = height / 2;
  const allowedRadius = 500;
  
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    // For each time step:
    // a. Update the position of each paper plane based on its current velocity.
    planes.forEach((plane) => {
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
    });
    // Render the paper planes as a visual representation, such as a series of dots or small triangles.
    planes.forEach((plane) => {
      context.fillStyle = 'black';
      context.beginPath();
      context.arc(plane.x, plane.y, 2, 0, Math.PI * 2);
      context.fill();
    });
    // A boundary check:
    // a. Check if the position of each paper plane is outside the boundaries of the simulation area.
    // If so, calculate the distance and direction to the center of the simulation area.
    planes.forEach((plane) => {
      const dx = plane.x - centerX;
      const dy = plane.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > allowedRadius) {
        // b. Apply a force to the paper plane to steer it back towards the center of the simulation area.
        // This force can be proportional to the distance from the center, or it can be a fixed force that is applied whenever the plane crosses the boundary.
        const force = 0.001;
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

