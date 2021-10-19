import {random} from './helpers.js';

export const particles = [];

const BASE_RADIUS = {
    protons: 10,
    neutrons: 10,
    electrons: 5,
};

const ELECTROSPHERE_OFFSET = [15, 25, 30, 40, 50, 60, 15];
const ELECTROSPHERES_NAMES = ['s', 'p', 'd', 'f', 'g', 'h', 'i'];
const ELECTRONS_PER_ELECTROSPHERE = [2, 8, 18, 32, 32, 18, 2];

export const periodicTable = [
    {
        name: 'Hydrogen', 
        color: '#63b9d5', 
        atomicNumber: 1,
        symbol: 'H',
        relativeMass: 1.00794,
        protons: 1,
        neutrons: 0,
        electrons: 1,
    },
    {
        name: 'Helium',
        color: '#d1c991',
        atomicNumber: 2,
        symbol: 'He',
        relativeMass: 4.002602,
        protons: 2,
        neutrons: 2,
        electrons: 2,
    },
    {
        name: 'Lithium',
        color: '#4c6168',
        atomicNumber: 3,
        symbol: 'Li',
        relativeMass: 6.941,
        protons: 3,
        neutrons: 4,
        electrons: 100,
    },
];

const randomInPeriodicTable = () => periodicTable[random(0, periodicTable.length, true)];


const computeElectrospheres = (electrons) => {
    let n = 0;
    while (electrons > 0) {
        electrons -= ELECTRONS_PER_ELECTROSPHERE[n];
        n++;
    }
    return n;
};

export const particleFactory = (minWidth, maxWidth, minHeight, maxHeight) => ({
    ...randomInPeriodicTable(),
    position: {x: random(minWidth, maxWidth), y: random(minHeight, maxHeight)},
    velocity: {x: 0, y: 0},
    acceleration: {x: 0, y: 0},
    update: function () {
        this.coreRadius = BASE_RADIUS.neutrons * this.neutrons + BASE_RADIUS.protons * this.protons;
        this.electrospheres = computeElectrospheres(this.electrons);
    },
    drawCore: function (context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.coreRadius, 0, 2 * Math.PI, false);
        context.fill();
    },
    drawElectrospheres: function (context) {
        let offset = 0;
        context.fillStyle = '#fff';
        context.strokeStyle = '#fff';
        context.font = '12px Arial';
        for (let i = 0; i < this.electrospheres; i++) {
            offset += ELECTROSPHERE_OFFSET[i];
            const text = ELECTROSPHERES_NAMES[i];
            const radius = this.coreRadius + offset;
            context.fillText(text, this.position.x + radius, this.position.y - ELECTROSPHERE_OFFSET[i]);
            context.beginPath();
            context.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
            context.stroke();
        }
    },
    drawElectrons: function (context) {
        // https://stackoverflow.com/questions/32681610/drawing-point-on-circle
        context.font = `${BASE_RADIUS.electrons}px Arial`;
        let offset = 0;
        let electronCount = this.electrons;
        for (let i = 0; i < this.electrospheres && electronCount > 0; i++) {
            offset += ELECTROSPHERE_OFFSET[i];
            const electronsToDraw = ELECTRONS_PER_ELECTROSPHERE[i];
            const radius = this.coreRadius + offset;
            const angle = Math.PI * 2 / Math.min(electronCount, electronsToDraw);
            for (let j = 0; j < electronsToDraw && electronCount > 0; j++) {
                context.beginPath();
                const x = this.position.x + radius * Math.cos(angle * j);
                const y = this.position.y + radius * Math.sin(angle * j);
                context.fillStyle = '#f00';
                context.arc(x, y, BASE_RADIUS.electrons, 0, 2 * Math.PI, false);
                context.fill();
                context.fillStyle = '#000';
                const quarterOfRadius = BASE_RADIUS.electrons / 4;
                context.fillText(j + 1, x - quarterOfRadius, y + quarterOfRadius);
                electronCount--;
            }
        }
    },
    drawText: function (context) {
        context.fillStyle = '#000';
        const halfRadius = this.coreRadius / 2;
        context.font = `${this.coreRadius}px Arial`;
        context.fillText(this.symbol, this.position.x - halfRadius, this.position.y + halfRadius / 1.5);
    },
    draw: function(context) {
        this.drawCore(context);
        this.drawText(context);
        this.drawElectrospheres(context);
        this.drawElectrons(context);
    },
});