
export const walls = [];

export const wallFactory = (x, y, width, height, orientation) => ({
    position: {x, y},
    width,
    height,
    top: orientation === 'top',
    bottom: orientation === 'bottom',
    left: orientation === 'left',
    right: orientation === 'right',
    color: '#fff',
    draw: function (context) {
        context.fillStyle = this.color;
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    },
    isCollidingWithParticle: function (particle) {
        const radius = particle.coreRadius + particle.electrospheresRadius;
        if (this.top) {
            return particle.position.y - radius < this.position.y + this.height;
        }
        if (this.bottom) {
            return particle.position.y + radius > this.position.y + this.height;
        }
        if (this.left) {
            return particle.position.x - radius < this.position.x + this.width;
        }
        if (this.right) {
            return particle.position.x + radius > this.position.x;
        }
        return false;
    },
});