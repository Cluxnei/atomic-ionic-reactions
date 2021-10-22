import { initCanvas, updateCanvas } from './helpers.js';
import {particles, particleFactory} from './particle.js';

const backgroundColor = '#000';

let canvas, context;

let width, height;

function start() {
    canvas = initCanvas();
    context = canvas.getContext('2d');
    width = window.innerWidth;
    height = window.innerHeight;
    updateCanvas(canvas, context, backgroundColor);
    initSimulation();
    loop();
}

const draw = () => {
    updateCanvas(canvas, context, backgroundColor);
    particles.forEach(particle => {
        particle.draw(context);
    });
};

const update = () => {
    particles.forEach(particle => {
        particle.update();
    });
};

const loop = () => {
    update();
    draw();
    requestAnimationFrame(loop);
};

window.addEventListener('load', start);

const RANDOM_PARTICLES = true;

const initSimulation = () => {
    if (RANDOM_PARTICLES) {
        const particleCount = 60;
        const minWidth = -width * 1;
        const maxWidth = width * 1;
        const minHeight = -height * 1;
        const maxHeight = height * 1;
        for (let i = 0; i < particleCount; i++) {
            particles.push(particleFactory(minWidth, maxWidth, minHeight, maxHeight));
        }
        return;
    }
    particles.push(particleFactory(0, 0, 0, 0));
    particles.push(particleFactory(400, 400, 0, 0));
    console.log(particles);
};

