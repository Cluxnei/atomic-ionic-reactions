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

const initSimulation = () => {
    const particleCount = 3;
    const minWidth = -width / 2;
    const maxWidth = width / 2;
    const minHeight = -height / 2;
    const maxHeight = height / 2;
    for (let i = 0; i < particleCount; i++) {
        particles.push(particleFactory(minWidth, maxWidth, minHeight, maxHeight));
    }
};

