/* ===== JS HEADER: ticker continuo ===== */
const contenedor = document.getElementById("contenedor");
const texto1 = contenedor ? contenedor.querySelector(".texto") : null;

if (contenedor && texto1) {
  const texto2 = texto1.cloneNode(true);
  contenedor.appendChild(texto2);

  const velocidad = 1;
  const espacio = 40;

  requestAnimationFrame(() => {
    const anchoTexto = texto1.offsetWidth;
    const anchoContenedor = contenedor.offsetWidth;

    let x1 = anchoContenedor;
    let x2 = anchoContenedor + anchoTexto + espacio;

    function animar() {
      x1 -= velocidad;
      x2 -= velocidad;

      if (x1 <= -anchoTexto) x1 = x2 + anchoTexto + espacio;
      if (x2 <= -anchoTexto) x2 = x1 + anchoTexto + espacio;

      texto1.style.left = x1 + "px";
      texto2.style.left = x2 + "px";

      requestAnimationFrame(animar);
    }

    animar();
  });
}

/* ===== JS HALL OF FAME: slider ===== */
const slider = document.getElementById("slider");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

const gap = 20;
const visibleCards = 3;
let currentIndex = 0;

function getCardWidth() {
  if (!slider) return 0;
  const card = slider.querySelector(".card");
  if (!card) return 0;
  return card.offsetWidth + gap;
}

function updateSlider() {
  if (!slider) return;
  const cardWidth = getCardWidth();
  slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

if (nextBtn && prevBtn && slider) {
  nextBtn.addEventListener("click", () => {
    const totalCards = slider.children.length;
    const maxIndex = totalCards - visibleCards;

    if (currentIndex < maxIndex) {
      currentIndex += visibleCards;
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      updateSlider();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= visibleCards;
      if (currentIndex < 0) currentIndex = 0;
      updateSlider();
    }
  });

  window.addEventListener("resize", updateSlider);
}

/* ===== JS SEARCH: habilitar input al click ===== */
const searchInput = document.getElementById("searchInput");
const searchIcon = document.getElementById("searchIcon");

if (searchInput && searchIcon) {
  searchIcon.addEventListener("click", () => {
    searchInput.disabled = false;
    searchInput.focus();
  });
}

/* ===== JS FOOTER: demo click socials ===== */
document.querySelectorAll('.footer-socials a').forEach(icon => {
  icon.addEventListener('click', e => {
    e.preventDefault();
    console.log('Social link clicked (demo)');
  });
});
