import { initCanvas, updateCanvas } from './helpers.js';
import {particles, particleFactory} from './particle.js';
import {walls, wallFactory} from './wall.js';

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

const RANDOM_PARTICLES = false;

const initSimulation = () => {

    walls.push(wallFactory(-width, -height / 10, width * 2, 10, 'top'));
    walls.push(wallFactory(-width, height / 10, width * 2, 10, 'bottom'));
    walls.push(wallFactory(-width / 10, -height, 10, height* 2, 'left'));
    walls.push(wallFactory(width / 10, -height, 10, height* 2, 'right'));


    if (RANDOM_PARTICLES) {
        const particleCount = 40;
        const minWidth = -width / 2;
        const maxWidth = width / 2;
        const minHeight = -height / 2;
        const maxHeight = height / 2;
        for (let i = 0; i < particleCount; i++) {
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
    console.log(particles);
};

