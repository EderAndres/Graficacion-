// index.js
import { CanvasLocal } from './CanvasLocal.js';

document.addEventListener("DOMContentLoaded", () => {
    // Apuntamos al ID correcto de tu HTML (circlechart)
    const canvas = document.getElementById("circlechart");
    const ctx = canvas.getContext("2d");
    
    const miPlano = new CanvasLocal(ctx, canvas);
    
    const inputFuncion = document.getElementById("functionInput");
    const btnPlot = document.getElementById("btnPlot");
    const btnZoomIn = document.getElementById("btnZoomIn");
    const btnZoomOut = document.getElementById("btnZoomOut");

    const actualizarGrafica = () => {
        const funcion = inputFuncion.value;
        miPlano.paintFunction(funcion);
    };

    btnPlot.addEventListener("click", actualizarGrafica);
    
    btnZoomIn.addEventListener("click", () => {
        miPlano.zoomIn();
        actualizarGrafica();
    });

    btnZoomOut.addEventListener("click", () => {
        miPlano.zoomOut();
        actualizarGrafica();
    });

    inputFuncion.addEventListener("keypress", (e) => {
        if (e.key === "Enter") actualizarGrafica();
    });

    // Dibujar por primera vez al cargar
    actualizarGrafica();
});