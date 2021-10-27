import { initCanvas, updateCanvas } from './helpers.js';
import {particles, particleFactory} from './particle.js';
import {walls, wallFactory} from './wall.js';
import {periodicTable} from './periodicTable.js';

const backgroundColor = '#000';

let canvas, context;

let width, height;

const dataFactory = () => ({
    particlesCount: null,
    disconnectedParticlesCount: null,
    connectedParticlesCount: null,
    moleculesCount: null,
    moleculeMaxSize: null,
});

const data = {
    elements: dataFactory(),
    values: dataFactory(),
};

function start() {
    canvas = initCanvas();
    context = canvas.getContext('2d');
    width = window.innerWidth;
    height = window.innerHeight;

    data.elements.particlesCount = document.getElementById('data-particles-count');
    data.elements.disconnectedParticlesCount = document.getElementById('data-disconnected-particles-count');
    data.elements.connectedParticlesCount = document.getElementById('data-connected-particles-count');
    data.elements.moleculesCount = document.getElementById('data-molecules-count');
    data.elements.moleculeMaxSize = document.getElementById('data-largest-molecule-size-count');

    updateCanvas(canvas, context, backgroundColor);
    initSimulation();
    loop();
}

const drawData = () => {
    Object.keys(data.values).forEach(key => {
        data.elements[key].innerText = data.values[key];
    });
};

const updateData = () => {

    const connectedAtoms = particles.filter(particle => particle.connectedParticles.size > 0);
    const disconnectedAtoms = particles.filter(particle => particle.connectedParticles.size === 0);

    data.values.particlesCount = particles.length;
    data.values.connectedParticlesCount = connectedAtoms.length;
    data.values.disconnectedParticlesCount = disconnectedAtoms.length;
    
    data.values.moleculeMaxSize = connectedAtoms
        .reduce((a, b) => Math.max(a, b.connectedParticles.size), 0);
        
    const ignoredAtoms = new Set();

    data.values.moleculesCount = connectedAtoms
        .reduce((a, {id, connectedParticles}) => {
            if (ignoredAtoms.has(id)) {
                return a;
            }
            [...connectedParticles, id].forEach(i => ignoredAtoms.add(i));
            return a + 1;
        }, 0);
};

const draw = () => {
    updateCanvas(canvas, context, backgroundColor);
    walls.forEach(wall => {
        wall.draw(context);
    });
    particles.forEach(particle => {
        particle.draw(context);
    });
    drawData();
};

const update = () => {
    particles.forEach(particle => {
        particle.update(walls);
    });
    updateData();
};

const loop = () => {
    update();
    draw();
    requestAnimationFrame(loop);
};

window.addEventListener('load', start);

const RANDOM_PARTICLES = true;

const WALLS_REDUCTION_FACTOR = 1;
const WALL_BASE_SIZE = 10;
const PARTICLES_COUNT = 30;

const initSimulation = () => {

    walls.push(wallFactory(-width, -height / WALLS_REDUCTION_FACTOR, width * 2, WALL_BASE_SIZE, 'top'));
    walls.push(wallFactory(-width, height / WALLS_REDUCTION_FACTOR, width * 2, WALL_BASE_SIZE, 'bottom'));
    walls.push(wallFactory(-width / WALLS_REDUCTION_FACTOR, -height, WALL_BASE_SIZE, height* 2, 'left'));
    walls.push(wallFactory(width / WALLS_REDUCTION_FACTOR, -height, WALL_BASE_SIZE, height* 2, 'right'));

    const largestParticle = particleFactory(0, 0, 0, 0, periodicTable[periodicTable.length - 1].atomicNumber);
    largestParticle.update([]);
    const maxRadius = largestParticle.coreRadius + largestParticle.electrospheresRadius;

    let minWidth = -width / 2;
    const leftWall = walls.find(wall => wall.left);
    if (leftWall) {
        minWidth = leftWall.position.x + leftWall.width + maxRadius;
    }
    let maxWidth = width / 2;
    const rightWall = walls.find(wall => wall.right);
    if (rightWall) {
        maxWidth = rightWall.position.x - rightWall.width - maxRadius;
    }
    let minHeight = -height / 2;
    const topWall = walls.find(wall => wall.top);
    if (topWall) {
        minHeight = topWall.position.y + topWall.height + maxRadius;
    }
    let maxHeight = height / 2;
    const bottomWall = walls.find(wall => wall.bottom);
    if (bottomWall) {
        maxHeight = bottomWall.position.y - bottomWall.height - maxRadius;
    }

    if (RANDOM_PARTICLES) {
        for (let i = 0; i < PARTICLES_COUNT; i++) {
            particles.push(particleFactory(minWidth, maxWidth, minHeight, maxHeight));
        }
        return;
    }
    // case 1
    // particles.push(particleFactory(0, 0, 0, 0, 16));
    // particles.push(particleFactory(30, 65, 0, 0, 1));
    // particles.push(particleFactory(-60, -65, 0, 0, 1));
    // case 2
    // particles.push(particleFactory(0, 0, -10, 0, 43));
    // particles.push(particleFactory(30, 65, 0, 0, 78));
    // particles.push(particleFactory(-60, -65, 0, 0, 27));
    // case 3
    particles.push(particleFactory(0, 0, 0, 0, 1));
    particles.push(particleFactory(-20, -20, 0, 0, 1));
    particles.push(particleFactory(0, 0, 20, 20, 1));
    particles.push(particleFactory(-20, -20, -20, -20, 1));
    particles.push(particleFactory(-20, -20, -25, -25, 1));
    console.log(particles);
};

