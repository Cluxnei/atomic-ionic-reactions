import {random} from './helpers.js';

export const particles = [];

const BASE_RADIUS = {
    protons: 4,
    neutrons: 5,
    electrons: 2,
};

const ELECTROSPHERE_OFFSET = [15, 25, 30, 40, 50, 60, 15];
const ELECTROSPHERES_NAMES = ['s', 'p', 'd', 'f', 'g', 'h', 'i'];
const ELECTRONS_PER_ELECTROSPHERE = [2, 8, 18, 32, 32, 18, 2];
const K = 500;

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
        {
        name: 'Beryllium',
        color: '#c8c8c8',
        atomicNumber: 4,
        symbol: 'Be',
        relativeMass: 9.012182,
        protons: 4,
        neutrons: 5,
        electrons: 4,
    },
    {
        name: 'Boron',
        color: '#7d5353',
        atomicNumber: 5,
        symbol: 'B',
        relativeMass: 10.811,
        protons: 5,
        neutrons: 6,
        electrons: 5,
    },
    {
        name: 'Carbon',
        color: '#3b3b3b',
        atomicNumber: 6,
        symbol: 'C',
        relativeMass: 12.0107,
        protons: 6,
        neutrons: 7,
        electrons: 6,
    },
    {
        name: 'Nitrogen',
        color: '#2cc6b2',
        atomicNumber: 7,
        symbol: 'N',
        relativeMass: 14.0067,
        protons: 7,
        neutrons: 8,
        electrons: 7,
    },
    {
        name: 'Oxygen',
        color: '#6fec98',
        atomicNumber: 8,
        symbol: 'O',
        relativeMass: 15.9994,
        protons: 8,
        neutrons: 9,
        electrons: 8,
    },
    {
        name: 'Fluorine',
        color: '#ecc46f',
        atomicNumber: 9,
        symbol: 'F',
        relativeMass: 18.9984032,
        protons: 9,
        neutrons: 10,
        electrons: 9,
    },
    {
        name: 'Neon',
        color: '#be0086',
        atomicNumber: 10,
        symbol: 'Ne',
        relativeMass: 20.1797,
        protons: 10,
        neutrons: 11,
        electrons: 10,
    },
    {
        name: 'Sodium',
        color: '#e69d7a',
        atomicNumber: 11,
        symbol: 'Na',
        relativeMass: 22.98976928,
        protons: 11,
        neutrons: 12,
        electrons: 11,
    },
    // ...
];

const randomInPeriodicTable = () => periodicTable[random(0, periodicTable.length, true)];


const applyColumbLaw = (chargeA, chargeB, distance) => {
    return K * -(chargeA * chargeB) / (distance * distance);
};

const normalizeVector = (vector) => {
    const mag = Math.hypot(vector.x, vector.y);
    return {
        x: vector.x / mag,
        y: vector.y / mag,
    };
};

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
    coreRadius: 0,
    updateCoreRadius: true,
    charge: 0,
    tendenceToStable: 0,
    electrospheres: 0,
    electrospheresRadius: 0,
    stopped: false,
    stopAfterCollision: true,
    update: function () {
        if (this.updateCoreRadius) {
            this.coreRadius = BASE_RADIUS.neutrons * this.neutrons + BASE_RADIUS.protons * this.protons;
            this.updateCoreRadius = false;
        }
        // TODO: check if update is needed
        this.electrospheres = computeElectrospheres(this.electrons);
        this.computeElectrospheresRadius();
        this.computeCharge();
        this.computeTendenceToStable();
        const collidingWith = this.collidingWith();
        if (collidingWith) {
            this.collide(collidingWith);
        }
        this.computeAcceleration();
        this.computeVelocity();
        this.computePosition();
    },
    collide: function (particle) {
        if (this.tendenceToStable > 0 && particle.tendenceToStable < 0) {
            this.stopped = true;
            particle.stopped = true;
            const valenceShellElectrons = particle.getNumberOfElectronsInElectrosphereLayer(particle.electrospheres);
            const electronsToGive = Math.min(Math.abs(particle.tendenceToStable), valenceShellElectrons);
            this.electrons += electronsToGive;
            particle.electrons -= electronsToGive;
        }
    },
    collidingWith: function () {
        return particles.find(p => p !== this && this.isCollidingWith(p));
    },
    isCollidingWith: function (particle) {
        const distanceVector = {
            x: particle.position.x - this.position.x,
            y: particle.position.y - this.position.y,
        };
        const distance = Math.hypot(distanceVector.x, distanceVector.y);
        const radius = this.coreRadius + this.electrospheresRadius;
        const particleRadius = particle.coreRadius + particle.electrospheresRadius;
        return distance < radius + particleRadius;
    },
    computeElectrospheresRadius: function () {
        let offset = 0;
        for (let i = 0; i < this.electrospheres; i++) {
            offset += ELECTROSPHERE_OFFSET[i];
        }
        this.electrospheresRadius = offset;
    },
    computeTendenceToStable: function () {
        const n = this.getNumberOfElectronsInElectrosphereLayer(this.electrospheres);
        const electronsToFillLayer = ELECTRONS_PER_ELECTROSPHERE[this.electrospheres - 1];
        if (this.electrospheres === 1) {
            this.tendenceToStable = electronsToFillLayer - n;
            return;
        }
        if (Math.abs(n) < Math.abs(electronsToFillLayer - n)) {
            this.tendenceToStable = -n;
            return;
        }
        this.tendenceToStable = electronsToFillLayer - n;
    },
    getNumberOfElectronsInElectrosphereLayer: function (layer) {
        let electronCount = this.electrons;
        for (let i = 0; i < this.electrospheres && electronCount > 0; i++) {
            if (i === layer - 1) {
                return electronCount;
            }
            const electronsInThisLayer = ELECTRONS_PER_ELECTROSPHERE[i];
            for (let j = 0; j < electronsInThisLayer && electronCount > 0; j++) {
                electronCount--;
            }
        }
        return 0;
    },
    computeCharge: function () {
        this.charge = this.protons - this.electrons;
    },
    computeVelocity: function () {
        if (this.stopped) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
    },
    computePosition: function () {
        if (this.stopped) {
            return;
        }
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    },
    computeAcceleration: function () {
        if (this.stopped) {
            this.acceleration.x = 0;
            this.acceleration.y = 0;
            return;
        }
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        particles.forEach(particle => {
            if (particle === this) {
                return;
            }
            const distanceVector = {
                x: particle.position.x - this.position.x,
                y: particle.position.y - this.position.y,
            };
            const distance = Math.hypot(distanceVector.x, distanceVector.y);
            
            const normalized = normalizeVector(distanceVector);
            const force = applyColumbLaw(this.tendenceToStable, particle.tendenceToStable, distance);
            this.acceleration.x += normalized.x * force;
            this.acceleration.y += normalized.y * force;
        });
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
        context.font = `${this.coreRadius / 1.5}px Arial`;
        let text = this.symbol;
        if (this.charge !== 0) {
            const absCharge = Math.abs(this.charge);
            text += (this.charge > 0 ? '+' : '-') + (absCharge > 1 ? absCharge : '');
        }
        context.fillText(text, this.position.x - halfRadius, this.position.y + halfRadius / 2.5);
    },
    draw: function(context) {
        context.globalAlpha = 0.75;
        this.drawCore(context);
        this.drawText(context);
        this.drawElectrospheres(context);
        this.drawElectrons(context);
    },
});