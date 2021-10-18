import {random} from './helpers.js';

export const particles = [];

const BASE_RADIUS = {
    protons: 10,
    neutrons: 10,
    electrons: 5,
};

const ELECTROSPHERE_OFFSET = [10, 10, 10, 10, 10, 10, 10];

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
        electrons: 3,
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
    draw: function(context) {
        // core
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.coreRadius, 0, Math.PI * 2);
        context.fill();
        // symbol text
        context.fillStyle = '#000';
        const halfRadius = this.coreRadius / 2;
        context.font = `${this.coreRadius}px Arial`;
        context.fillText(this.symbol, this.position.x - halfRadius, this.position.y + halfRadius / 1.5);
        // electrospheres
        context.strokeStyle = '#fff';
        let offset = 0;
        for (let i = 0; i < this.electrospheres; i++) {
            offset += ELECTROSPHERE_OFFSET[i];
            context.beginPath();
            context.arc(this.position.x, this.position.y, this.coreRadius + offset, 0, Math.PI * 2);
            context.stroke();
        }
    },
});