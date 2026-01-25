const texto = document.getElementById("texto");
const contenedor = texto.parentElement;

let posicion = contenedor.offsetWidth;
const velocidad = 1; // píxeles por frame

function moverTexto() {
    posicion -= velocidad;
    texto.style.left = posicion + "px";

    // Cuando el texto sale completamente por la izquierda del 70%
    if (posicion < -texto.offsetWidth) {
        posicion = contenedor.offsetWidth; // reaparece por la derecha del 70%
    }

    requestAnimationFrame(moverTexto);
}

moverTexto();
