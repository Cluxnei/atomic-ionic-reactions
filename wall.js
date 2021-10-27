
export const walls = [];

export const wallFactory = (x, y, width, height) => ({
    x,
    y,
    width,
    height,
    color: '#fff',
    draw: function (context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    },
});