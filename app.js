const galeria = document.getElementById('galeria-animales');
const buscador = document.getElementById('buscador');
const botonesFiltro = document.querySelectorAll('.btn-filtro');

let filtroCategoria = 'Todos';
let busquedaTexto = '';

const categoriaEN = {
    'Mamíferos': 'Mammals',
    'Aves': 'Birds',
    'Reptiles': 'Reptiles',
    'Anfibios': 'Amphibians'
};


function voltearTarjeta(btn) {
    const interior = btn.closest('.tarjeta-interior');
    interior.classList.toggle('volteada');
    const volteada = interior.classList.contains('volteada');
    const pronunciarBtn = interior.closest('.tarjeta-animal').querySelector('.btn-pronunciar');
    pronunciarBtn.textContent = volteada ? '🔊 Pronounce in English' : '🔊 Pronunciar en español';
}

function mostrarAnimales() {
    galeria.innerHTML = '';

    const animalesFiltrados = animales.filter(animal => {
        const coincideCategoria = filtroCategoria === 'Todos' || animal.categoria === filtroCategoria;
        const texto = busquedaTexto.toLowerCase();
        const coincideNombreEs = animal.nombreEspanol.toLowerCase().includes(texto);
        const coincideNombreEn = animal.nombreIngles.toLowerCase().includes(texto);
        const coincideCientifico = animal.cientificoEspanol.toLowerCase().includes(texto);
        return coincideCategoria && (coincideNombreEs || coincideNombreEn || coincideCientifico);
    });

    if (animalesFiltrados.length === 0) {
        galeria.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--texto-mutado); padding: 40px;">No se encontraron animales que coincidan con tu búsqueda.</p>`;
        return;
    }

    animalesFiltrados.forEach(animal => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta-animal';

        const catEN = categoriaEN[animal.categoria] || animal.categoria;

        tarjeta.innerHTML = `
            <div class="tarjeta-interior">
                <div class="tarjeta-frente">
                    <div class="tarjeta-idioma-banner banner-es">
                        <span>🇨🇷&nbsp; Español</span>
                        <button class="btn-voltear" onclick="voltearTarjeta(this)" title="Ver en inglés">⇄</button>
                    </div>
                    <img class="animal-imagen" src="${animal.imagen}" alt="${animal.nombreEspanol}" loading="lazy">
                    <div class="animal-info">
                        <span class="categoria-tag">${animal.categoria} / ${catEN}</span>
                        <h2 class="nombre-principal">${animal.nombreEspanol}</h2>
                        <p class="cientifico">🔬 ${animal.cientificoEspanol}</p>
                        <p class="descripcion">${animal.descripcionEspanol}</p>
                    </div>
                </div>
                <div class="tarjeta-reverso">
                    <div class="tarjeta-idioma-banner banner-en">
                        <span>🇬🇧&nbsp; English</span>
                        <button class="btn-voltear" onclick="voltearTarjeta(this)" title="Back to Spanish">⇄</button>
                    </div>
                    <img class="animal-imagen" src="${animal.imagen}" alt="${animal.nombreIngles}" loading="lazy">
                    <div class="animal-info">
                        <span class="categoria-tag categoria-tag-en">${catEN} / ${animal.categoria}</span>
                        <h2 class="nombre-principal">${animal.nombreIngles}</h2>
                        <p class="cientifico">🔬 ${animal.cientificoIngles}</p>
                        <p class="descripcion">${animal.descripcionIngles}</p>
                    </div>
                </div>
            </div>
            <button class="btn-pronunciar"
                    data-es="${animal.nombreEspanol}"
                    data-en="${animal.nombreIngles}">
                🔊 Pronunciar en español
            </button>
        `;

        galeria.appendChild(tarjeta);
    });
}

buscador.addEventListener('input', (e) => {
    busquedaTexto = e.target.value;
    mostrarAnimales();
});

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        document.querySelector('.btn-filtro.activo').classList.remove('activo');
        boton.classList.add('activo');
        filtroCategoria = boton.getAttribute('data-categoria');
        mostrarAnimales();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    mostrarAnimales();
});

// Cargar voces disponibles al inicio (Chrome las carga de forma asíncrona)
let vocesDisponibles = [];
if (window.speechSynthesis) {
    const cargarVoces = () => { vocesDisponibles = window.speechSynthesis.getVoices(); };
    cargarVoces();
    window.speechSynthesis.addEventListener('voiceschanged', cargarVoces);
}

// Pronunciación — botón fuera del flip, detecta estado de la tarjeta
galeria.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-pronunciar');
    if (!btn || !window.speechSynthesis) return;

    const interior = btn.closest('.tarjeta-animal').querySelector('.tarjeta-interior');
    const volteada = interior.classList.contains('volteada');
    const texto = volteada ? btn.dataset.en : btn.dataset.es;
    const lang  = volteada ? 'en-US' : 'es-CR';
    const prefix = lang.split('-')[0];

    const utt = new SpeechSynthesisUtterance(texto);
    utt.lang = lang;
    utt.rate = 0.85;

    // Priorizar voces naturales de Microsoft, luego cualquier voz del idioma
    const voz = vocesDisponibles.find(v => v.lang === lang && v.name.includes('Online'))
             || vocesDisponibles.find(v => v.lang === lang)
             || vocesDisponibles.find(v => v.lang.startsWith(prefix));
    if (voz) utt.voice = voz;

    window.speechSynthesis.speak(utt);
});
