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
        let r = Math.min(this.maxX, this.maxY) * 0.40;
        
        let xA = this.centerX + r * Math.cos(0),               yA = this.centerY + r * Math.sin(0);
        let xB = this.centerX + r * Math.cos(Math.PI / 3),     yB = this.centerY + r * Math.sin(Math.PI / 3);
        let xC = this.centerX + r * Math.cos(2 * Math.PI / 3), yC = this.centerY + r * Math.sin(2 * Math.PI / 3);
        let xD = this.centerX + r * Math.cos(Math.PI),         yD = this.centerY + r * Math.sin(Math.PI);
        let xE = this.centerX + r * Math.cos(4 * Math.PI / 3), yE = this.centerY + r * Math.sin(4 * Math.PI / 3);
        let xF = this.centerX + r * Math.cos(5 * Math.PI / 3), yF = this.centerY + r * Math.sin(5 * Math.PI / 3);

        let q = 0.05;
        let p = 1 - q;

        for (let i = 0; i < 50; i++) {
            this.drawLine(xA, yA, xB, yB);
            this.drawLine(xB, yB, xC, yC);
            this.drawLine(xC, yC, xD, yD);
            this.drawLine(xD, yD, xE, yE);
            this.drawLine(xE, yE, xF, yF);
            this.drawLine(xF, yF, xA, yA);

            let xA1 = p * xA + q * xB; let yA1 = p * yA + q * yB;
            let xB1 = p * xB + q * xC; let yB1 = p * yB + q * yC;
            let xC1 = p * xC + q * xD; let yC1 = p * yC + q * yD;
            let xD1 = p * xD + q * xE; let yD1 = p * yD + q * yE;
            let xE1 = p * xE + q * xF; let yE1 = p * yE + q * yF;
            let xF1 = p * xF + q * xA; let yF1 = p * yF + q * yA;

            xA = xA1; yA = yA1;
            xB = xB1; yB = yB1;
            xC = xC1; yC = yC1;
            xD = xD1; yD = yD1;
            xE = xE1; yE = yE1;
            xF = xF1; yF = yF1;
        }
    }
}