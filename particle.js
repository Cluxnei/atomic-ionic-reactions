import {random} from './helpers.js';
import {periodicTable} from './periodicTable.js';

export const particles = [];

let _last_particle_id = 0;

const getNextParticleId = () => _last_particle_id++;

const BASE_RADIUS = {
    protons: 1,
    neutrons: 1,
    electrons: 2,
};

const FIXED_RADIUS = 20;
const GLOBAL_ALPHA = 0.75;
// const ELECTROSPHERE_OFFSET = [15, 25, 30, 40, 50, 60, 15];
const ELECTROSPHERE_OFFSET = [10, 10, 10, 10, 10, 10, 10];
const ELECTROSPHERES_NAMES = ['s', 'p', 'd', 'f', 'g', 'h', 'i'];
const ELECTRONS_PER_ELECTROSPHERE = [2, 8, 18, 32, 32, 18, 2];
const K = 5;

const randomInPeriodicTable = (customAtomicNumber = null) => 
    customAtomicNumber 
    ? periodicTable.find(atom => atom.atomicNumber === customAtomicNumber)
    : periodicTable[random(0, periodicTable.length, true)];

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

export const particleFactory = (minWidth, maxWidth, minHeight, maxHeight, customAtomicNumber = null) => ({
    ...randomInPeriodicTable(customAtomicNumber),
    id: getNextParticleId(),
    position: {x: random(minWidth, maxWidth), y: random(minHeight, maxHeight)},
    velocity: {x: 0, y: 0},
    acceleration: {x: 0, y: 0},
    coreRadius: 0,
    updateCoreRadius: true,
    charge: 0,
    tendenceToStable: 0,
    electrospheres: 0,
    electrospheresRadius: 0,
    connectedParticles: new Set(),
    update: function () {
        if (this.updateCoreRadius) {
            // this.coreRadius = BASE_RADIUS.neutrons * this.neutrons + BASE_RADIUS.protons * this.protons;
            this.coreRadius = FIXED_RADIUS;
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
        this.computeMolecularAcceleration();
        this.computeVelocity();
        this.computeMolecularVelocity();
        this.computeOrganizationVelocity();
        this.computePosition();
    },
    collide: function (particle) {
        if (this.tendenceToStable > 0 && particle.tendenceToStable < 0) {
            const valenceShellElectrons = particle.getNumberOfElectronsInElectrosphereLayer(particle.electrospheres);
            const electronsToGive = Math.min(Math.abs(particle.tendenceToStable), valenceShellElectrons, Math.abs(this.tendenceToStable));
            this.electrons += electronsToGive;
            particle.electrons -= electronsToGive;
            this.connectedParticles.add(particle.id);
            particle.connectedParticles.add(this.id);
            for (const particleId of this.connectedParticles) {
                particle.connectedParticles.add(particleId);
            }
            for (const particleId of particle.connectedParticles) {
                this.connectedParticles.add(particleId);
            }
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
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
    },
    computePosition: function () {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    },
    computeAcceleration: function () {
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
    computeMolecularAcceleration: function () {
        let n = 1;
        const accelerationResultant = {...this.acceleration};

        for (const particleId of this.connectedParticles) {
            if (particleId === this.id) {
                continue;
            }
            const particle = particles.find(p => p.id === particleId);
            if (!particle || particle === this) {
                continue;
            }
            accelerationResultant.x += particle.acceleration.x;
            accelerationResultant.y += particle.acceleration.y;
            n++;
        }
        accelerationResultant.x /= n;
        accelerationResultant.y /= n;

        for (const particleId of this.connectedParticles) {
            if (particleId === this.id) {
                continue;
            }
            const particle = particles.find(p => p.id === particleId);
            if (!particle || particle === this) {
                continue;
            }
            particle.acceleration = {...accelerationResultant};
        }
        this.acceleration = {...accelerationResultant};
    },
    computeMolecularVelocity: function () {
        let n = 1;
        const velocityResultant = {...this.velocity};

        for (const particleId of this.connectedParticles) {
            if (particleId === this.id) {
                continue;
            }
            const particle = particles.find(p => p.id === particleId);
            if (!particle || particle === this) {
                continue;
            }
            velocityResultant.x += particle.velocity.x;
            velocityResultant.y += particle.velocity.y;
            n++;
        }
        velocityResultant.x /= n;
        velocityResultant.y /= n;

        for (const particleId of this.connectedParticles) {
            if (particleId === this.id) {
                continue;
            }
            const particle = particles.find(p => p.id === particleId);
            if (!particle || particle === this) {
                continue;
            }
            particle.velocity = {...velocityResultant};
        }
        this.velocity = {...velocityResultant};
    },
    computeOrganizationVelocity: function () {
        const COLLIDING_OFFSET = 1.5;
        const radius = this.coreRadius + this.electrospheresRadius;
        for (const particleId of this.connectedParticles) {
            if (particleId === this.id) {
                continue;
            }
            const particle = particles.find(p => p.id === particleId);
            if (!particle || particle === this) {
                continue;
            }
            const distanceVector = {
                x: particle.position.x - this.position.x,
                y: particle.position.y - this.position.y,
            };
            const distance = Math.hypot(distanceVector.x, distanceVector.y);
            const particleRadius = particle.coreRadius + particle.electrospheresRadius;
            const sumOfRadius = radius + particleRadius;
            if (distance > sumOfRadius * COLLIDING_OFFSET) {
                continue;
            }
            const offset = distance - sumOfRadius;
            const normalized = normalizeVector(distanceVector);
            if (offset >= -COLLIDING_OFFSET && offset <= COLLIDING_OFFSET) {
                continue;
            }
            const attractionCharge = offset / 10;
            const force = applyColumbLaw(offset < 0 ? attractionCharge : -attractionCharge, attractionCharge, offset);
            this.velocity.x = normalized.x * force;
            this.velocity.y = normalized.y * force;
        }
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
        const halfRadius = this.coreRadius / 1.5;
        context.font = `${this.coreRadius / 2}px Arial`;
        let text = this.symbol;
        if (this.charge !== 0) {
            const absCharge = Math.abs(this.charge);
            text += (this.charge > 0 ? '+' : '-') + (absCharge > 1 ? absCharge : '');
        }
        context.fillText(text, this.position.x - halfRadius, this.position.y + halfRadius / 2.5);
    },
    drawConnections: function(context) {
        context.strokeStyle = `rgba(255, 255, 255, ${GLOBAL_ALPHA})`;
        for (const id of this.connectedParticles) {
            const particle = particles.find(p => p.id === id);
            context.beginPath();
            context.moveTo(particle.position.x, particle.position.y);
            context.lineTo(this.position.x, this.position.y);
            context.stroke();
        }
    },
    draw: function(context) {
        context.globalAlpha = GLOBAL_ALPHA;
        this.drawCore(context);
        this.drawConnections(context);
        this.drawText(context);
        this.drawElectrospheres(context);
        this.drawElectrons(context);
    },
});