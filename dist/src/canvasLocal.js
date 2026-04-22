export class CanvasLocal {
    constructor(g, canvas) {
        this.graphics = g;
        this.maxX = canvas.width - 1;
        this.maxY = canvas.height - 1;
        this.centerX = this.maxX / 2;
        this.centerY = this.maxY / 2;
    }

    iX(x) { return Math.round(x); }
    iY(y) { return this.maxY - Math.round(y); }

    drawLine(x1, y1, x2, y2) {
        this.graphics.beginPath();
        this.graphics.moveTo(x1, y1);
        this.graphics.lineTo(x2, y2);
        this.graphics.stroke();
    }

    paint() {
        const size = Math.min(this.maxX, this.maxY) * 0.4; 
        const points = [];

        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = this.centerX + size * Math.cos(angle);
            const py = this.centerY + size * Math.sin(angle);
            points.push({ x: px, y: py });
        }

        for (let i = 0; i < 6; i++) {
            const currentPoint = points[i];
            const nextPoint = points[(i + 1) % 6]; 
            this.drawLine(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y);
        }
    }
}
