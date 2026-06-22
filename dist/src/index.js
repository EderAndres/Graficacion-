import { Obj3D } from './Obj3D.js';
import { CvZbuf } from './CvZbufFlatV2.js';
import { Rota3D } from './Rota3D.js';
import { Point3D } from './point3D.js';
console.log("=== NUEVO RENDERIZADOR 3D CARGADO (VERSIÓN 1.5) ===");
let canvas;
let graphics;
canvas = document.getElementById('circlechart');
graphics = canvas.getContext('2d');
let cv;
let obj;
// Ángulos cinemáticos
let angleBase = 0;
let angleShoulder = 0;
let angleElbow = 0;
let angleGripper = 0;
function leerArchivo(e) {
    var archivo = e.target.files[0];
    if (!archivo) {
        return;
    }
    var lector = new FileReader();
    lector.onload = function (e) {
        var contenido = e.target.result;
        mostrarContenido(contenido);
        obj = new Obj3D();
        obj.name = archivo.name;
        if (obj.read(contenido)) {
            cv = new CvZbuf(graphics, canvas);
            cv.setObj(obj);
            resetAngles();
            applyKinematics();
            actualizarVisibilidadControles(archivo.name);
        }
    };
    lector.readAsText(archivo);
}
function mostrarContenido(contenido) {
    var elemento = document.getElementById('contenido-archivo');
    if (elemento)
        elemento.innerHTML = contenido;
}
function vp(dTheta, dPhi, fRho) {
    if (obj != undefined) {
        let obj = cv.getObj();
        if (!obj.vp(cv, dTheta, dPhi, fRho))
            alert('Datos no válidos');
    }
    else
        alert('Aún no has leído un archivo');
}
function eyeDownFunc() { vp(0, 0.1, 1); }
function eyeUpFunc() { vp(0, -0.1, 1); }
function eyeLeftFunc() { vp(-0.1, 0, 1); }
function eyeRightFunc() { vp(0.1, 0, 1); }
function incrDistFunc() { vp(0, 0, 2); }
function decrDistFunc() { vp(0, 0, 0.5); }
// Resolver la cinemática directa
function applyKinematics() {
    if (!obj || !obj.wOrg)
        return;
    // 1. Restaurar coordenadas al estado original
    let n = obj.wOrg.length;
    for (let i = 1; i < n; i++) {
        if (obj.wOrg[i] != undefined) {
            obj.w[i] = new Point3D(obj.wOrg[i].x, obj.wOrg[i].y, obj.wOrg[i].z);
        }
    }
    // 2. Rotar pinzas de la garra (si existen en el archivo)
    let radGripper = angleGripper * Math.PI / 180;
    if (obj.wOrg[301] !== undefined && obj.wOrg[300] !== undefined && obj.wOrg[319] !== undefined) {
        // Pinza izquierda rota sobre su eje Z local wOrg[300]-wOrg[319]
        Rota3D.initRotate(obj.wOrg[300], obj.wOrg[319], radGripper);
        for (let i = 301; i <= 312; i++) {
            if (obj.w[i])
                obj.w[i] = Rota3D.rotate(obj.w[i]);
        }
    }
    if (obj.wOrg[321] !== undefined && obj.wOrg[320] !== undefined && obj.wOrg[339] !== undefined) {
        // Pinza derecha rota en sentido opuesto
        Rota3D.initRotate(obj.wOrg[320], obj.wOrg[339], -radGripper);
        for (let i = 321; i <= 332; i++) {
            if (obj.w[i])
                obj.w[i] = Rota3D.rotate(obj.w[i]);
        }
    }
    // 3. Rotar brazo superior (201-238) y garra (300-339) sobre el pivote del codo (139-140)
    let radElbow = angleElbow * Math.PI / 180;
    if (obj.wOrg[139] !== undefined && obj.wOrg[140] !== undefined) {
        Rota3D.initRotate(obj.wOrg[139], obj.wOrg[140], radElbow);
        // Rotar brazo superior
        for (let i = 201; i <= 238; i++) {
            if (obj.w[i])
                obj.w[i] = Rota3D.rotate(obj.w[i]);
        }
        // Rotar garra y sus ejes locales correspondientes
        for (let i = 300; i <= 339; i++) {
            if (obj.w[i])
                obj.w[i] = Rota3D.rotate(obj.w[i]);
        }
    }
    // 4. Rotar brazo inferior (101-138), superior y garra sobre el pivote del hombro (29-30)
    let radShoulder = angleShoulder * Math.PI / 180;
    if (obj.wOrg[29] !== undefined && obj.wOrg[30] !== undefined) {
        Rota3D.initRotate(obj.wOrg[29], obj.wOrg[30], radShoulder);
        // Rotar brazo inferior
        for (let i = 101; i <= 138; i++) {
            if (obj.w[i])
                obj.w[i] = Rota3D.rotate(obj.w[i]);
        }
        // Rotar los ejes del codo para seguir el hombro
        if (obj.w[139])
            obj.w[139] = Rota3D.rotate(obj.w[139]);
        if (obj.w[140])
            obj.w[140] = Rota3D.rotate(obj.w[140]);
        // Rotar brazo superior
        for (let i = 201; i <= 238; i++) {
            if (obj.w[i])
                obj.w[i] = Rota3D.rotate(obj.w[i]);
        }
        // Rotar garra y sus ejes
        for (let i = 300; i <= 339; i++) {
            if (obj.w[i])
                obj.w[i] = Rota3D.rotate(obj.w[i]);
        }
    }
    // 5. Rotar todo alrededor de la base (Eje vertical Z: wOrg[98] a wOrg[99] o por defecto el eje Z absoluto)
    let radBase = angleBase * Math.PI / 180;
    let axisA = obj.wOrg[98] ? obj.wOrg[98] : new Point3D(0, 0, 0);
    let axisB = obj.wOrg[99] ? obj.wOrg[99] : new Point3D(0, 0, 1);
    Rota3D.initRotate(axisA, axisB, radBase);
    // Rotar ejes del hombro
    if (obj.w[29])
        obj.w[29] = Rota3D.rotate(obj.w[29]);
    if (obj.w[30])
        obj.w[30] = Rota3D.rotate(obj.w[30]);
    // Rotar ejes del codo
    if (obj.w[139])
        obj.w[139] = Rota3D.rotate(obj.w[139]);
    if (obj.w[140])
        obj.w[140] = Rota3D.rotate(obj.w[140]);
    // Rotar brazo inferior
    for (let i = 101; i <= 138; i++) {
        if (obj.w[i])
            obj.w[i] = Rota3D.rotate(obj.w[i]);
    }
    // Rotar brazo superior
    for (let i = 201; i <= 238; i++) {
        if (obj.w[i])
            obj.w[i] = Rota3D.rotate(obj.w[i]);
    }
    // Rotar garra
    for (let i = 300; i <= 339; i++) {
        if (obj.w[i])
            obj.w[i] = Rota3D.rotate(obj.w[i]);
    }
    // 6. Actualizar visualizador y pintar
    cv.setObj(obj);
    cv.paint();
}
function resetAngles() {
    angleBase = 0;
    angleShoulder = 0;
    angleElbow = 0;
    angleGripper = 0;
    // Restaurar sliders en la UI
    let sliderBase = document.getElementById('sliderBase');
    let sliderShoulder = document.getElementById('sliderShoulder');
    let sliderElbow = document.getElementById('sliderElbow');
    let sliderGripper = document.getElementById('sliderGripper');
    if (sliderBase)
        sliderBase.value = "0";
    if (sliderShoulder)
        sliderShoulder.value = "0";
    if (sliderElbow)
        sliderElbow.value = "0";
    if (sliderGripper)
        sliderGripper.value = "0";
    // Restaurar etiquetas en la UI
    let valBase = document.getElementById('valBase');
    let valShoulder = document.getElementById('valShoulder');
    let valElbow = document.getElementById('valElbow');
    let valGripper = document.getElementById('valGripper');
    if (valBase)
        valBase.innerText = "0°";
    if (valShoulder)
        valShoulder.innerText = "0°";
    if (valElbow)
        valElbow.innerText = "0°";
    if (valGripper)
        valGripper.innerText = "0°";
}
function actualizarVisibilidadControles(fileName) {
    let controlsDiv = document.getElementById('robot-controls');
    if (controlsDiv) {
        if (fileName.toLowerCase().includes('brazo')) {
            controlsDiv.style.display = 'block';
        }
        else {
            controlsDiv.style.display = 'none';
        }
    }
}
// Cargar modelos preestablecidos vía Fetch (AJAX)
function cargarModeloPredeterminado(fileName) {
    let contenidoArchivo = document.getElementById('contenido-archivo');
    if (contenidoArchivo)
        contenidoArchivo.innerText = "Cargando modelo " + fileName + "...";
    fetch('./' + fileName)
        .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo: ' + fileName);
        }
        return response.text();
    })
        .then(contenido => {
        mostrarContenido(contenido);
        obj = new Obj3D();
        obj.name = fileName;
        if (obj.read(contenido)) {
            cv = new CvZbuf(graphics, canvas);
            cv.setObj(obj);
            resetAngles();
            applyKinematics();
            actualizarVisibilidadControles(fileName);
        }
    })
        .catch(error => {
        console.error(error);
        if (contenidoArchivo)
            contenidoArchivo.innerText = "Error al cargar modelo:\n" + error.message;
    });
}
// Vinculación de eventos a los sliders
document.getElementById('sliderBase').addEventListener('input', (e) => {
    angleBase = Number(e.target.value);
    document.getElementById('valBase').innerText = angleBase + "°";
    applyKinematics();
});
document.getElementById('sliderShoulder').addEventListener('input', (e) => {
    angleShoulder = Number(e.target.value);
    document.getElementById('valShoulder').innerText = angleShoulder + "°";
    applyKinematics();
});
document.getElementById('sliderElbow').addEventListener('input', (e) => {
    angleElbow = Number(e.target.value);
    document.getElementById('valElbow').innerText = angleElbow + "°";
    applyKinematics();
});
document.getElementById('sliderGripper').addEventListener('input', (e) => {
    angleGripper = Number(e.target.value);
    document.getElementById('valGripper').innerText = angleGripper + "°";
    applyKinematics();
});
document.getElementById('btnReset').addEventListener('click', () => {
    resetAngles();
    applyKinematics();
});
// Listeners de selección de modelo y carga de archivos locales eliminados
// Eventos de botones de cámara en el dropdown
document.getElementById('eyeDown').addEventListener('click', eyeDownFunc, false);
document.getElementById('eyeUp').addEventListener('click', eyeUpFunc, false);
document.getElementById('eyeLeft').addEventListener('click', eyeLeftFunc, false);
document.getElementById('eyeRight').addEventListener('click', eyeRightFunc, false);
document.getElementById('incrDist').addEventListener('click', incrDistFunc, false);
document.getElementById('decrDist').addEventListener('click', decrDistFunc, false);
// Rotación interactiva con arrastre de mouse
let Pix, Piy;
let Pfx, Pfy;
let flag = false;
function handleMouse(evento) {
    Pix = evento.offsetX;
    Piy = evento.offsetY;
    flag = true;
}
function makeVisualisation(evento) {
    if (flag) {
        Pfx = evento.offsetX;
        Pfy = evento.offsetY;
        let difX = Pix - Pfx;
        let difY = Pfy - Piy;
        vp(0, 0.005 * difY, 1); // Sensibilidad reducida para rotación más lenta
        Piy = Pfy;
        vp(0.005 * difX, 0, 1); // Sensibilidad reducida para rotación más lenta
        Pix = Pfx;
    }
}
function noDraw() {
    flag = false;
}
canvas.addEventListener('mousedown', handleMouse);
canvas.addEventListener('mouseup', noDraw);
canvas.addEventListener('mousemove', makeVisualisation);
// Cargar archivo local de vuelta
document.getElementById('file-input').addEventListener('change', leerArchivo, false);
// Cargar modelo del brazo robótico al iniciar la página
window.addEventListener('load', () => {
    cargarModeloPredeterminado('brazo.txt');
});
