
export const random = (min, max, absolute = false) => {
    const value = Math.floor(Math.random() * (max - min)) + min;
    return absolute ? Math.abs(value) : value;
};

export const initCanvas = () => {
    const canvas = document.querySelector('#canvas');
    
    canvas.zoom = 0.4;
    canvas.positionX = 0;
    canvas.positionY = 0;
    canvas._previousTouch = null;
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    canvas.addEventListener('mousemove', (event) => {
        if(!canvas.dragging) {
            return;
        }
        canvas.positionX = (canvas.positionX || 0) + event.movementX;
        canvas.positionY = (canvas.positionY || 0) + event.movementY;
    });

    canvas.addEventListener('touchstart', (event) => {
        canvas.dragging = true;
        canvas._previousTouch = event.touches[0];
    });

    canvas.addEventListener('touchmove', (event) => {
        if(!canvas.dragging) {
            return;
        }
        const touch = event.touches[0];
        if (canvas._previousTouch) {
            event.movementX = touch.clientX - canvas._previousTouch.clientX;
            event.movementY = touch.clientY - canvas._previousTouch.clientY;

            canvas.positionX = (canvas.positionX || 0) + event.movementX;
            canvas.positionY = (canvas.positionY || 0) + event.movementY;
        };
        canvas._previousTouch = touch;
        
    });

    canvas.addEventListener('touchstop', () => {
        canvas.dragging = false;
        canvas._previousTouch = null;
    });

    canvas.addEventListener('mousedown', () => {
        canvas.dragging = true;
    });

    canvas.addEventListener('mouseup', () => {
        canvas.dragging = false;
    });

    canvas.addEventListener('wheel', (event) =>{        
        canvas.zoom -= event.deltaY / 3000 * canvas.zoom;
    });
    
    window.addEventListener('resize', resizeCanvas, false);

    resizeCanvas();

    return canvas;
}

export const updateCanvas = (canvas, ctx, BACKGROUND_COLOR) => {
    const zoom = canvas.zoom;
    const x = canvas.positionX || 0;
    const y = canvas.positionY || 0;
    
    ctx.resetTransform();
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.translate(canvas.clientWidth / 2 + x, canvas.clientHeight / 2 + y);
    ctx.scale(zoom, zoom);
}