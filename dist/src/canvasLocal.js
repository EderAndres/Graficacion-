// CanvasLocal.js
export class CanvasLocal {
    constructor(g, canvas) {
        this.graphics = g;
        this.canvas = canvas;
        this.maxX = canvas.width;
        this.maxY = canvas.height;
        this.centerX = this.maxX / 2;
        this.centerY = this.maxY / 2;
        this.escala = 40; // Zoom inicial
    }

    iX(x) { return this.centerX + (x * this.escala); }
    iY(y) { return this.centerY - (y * this.escala); }

    drawAxes() {
        this.graphics.clearRect(0, 0, this.maxX, this.maxY);
        this.graphics.strokeStyle = "#aaaaaa";
        this.graphics.lineWidth = 1;
        this.graphics.beginPath();
        
        // Eje X
        this.graphics.moveTo(0, this.centerY);
        this.graphics.lineTo(this.maxX, this.centerY);
        
        // Eje Y
        this.graphics.moveTo(this.centerX, 0);
        this.graphics.lineTo(this.centerX, this.maxY);
        
        this.graphics.stroke();
    }

    paintFunction(funcionStr) {
        this.drawAxes();
        
        this.graphics.strokeStyle = "#0d6efd"; // Color azul de Bootstrap
        this.graphics.lineWidth = 2;
        this.graphics.beginPath();

        // Reemplazar funciones trigonométricas/matemáticas para el Modo Estricto
        // Convierte "sin(x)" en "Math.sin(x)" automáticamente
        let funcionSegura = funcionStr.replace(/(sin|cos|tan|log|exp|sqrt|abs)/g, 'Math.$1');

        let f;
        try {
            f = new Function('x', `return ${funcionSegura};`);
        } catch (e) {
            console.error("Error en la sintaxis de la función.");
            return;
        }

        let firstPoint = true;

        for (let px = 0; px <= this.maxX; px += 2) { // px += 2 para optimizar rendimiento
            let xMatematico = (px - this.centerX) / this.escala;
            
            try {
                let yMatematico = f(xMatematico);
                
                if (isNaN(yMatematico) || !isFinite(yMatematico)) {
                    firstPoint = true;
                    continue;
                }

                let py = this.iY(yMatematico);

                if (firstPoint) {
                    this.graphics.moveTo(px, py);
                    firstPoint = false;
                } else {
                    this.graphics.lineTo(px, py);
                }
            } catch (error) {
                // Silenciar errores de evaluación por punto
            }
        }
        this.graphics.stroke();
    }

    zoomIn() {
        this.escala *= 1.2;
    }

    zoomOut() {
        this.escala /= 1.2;
    }
}
