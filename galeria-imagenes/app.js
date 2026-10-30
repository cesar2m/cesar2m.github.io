// URL base de tu backend en Heroku (cámbiala por tu endpoint real si es diferente)
const API_BASE_URL = "https://rippling-haphazard-tweet.ngrok-free.dev/api/v1/chatbot/imageGallery";

document.addEventListener("DOMContentLoaded", () => {
    // Capturar parámetros de la URL (ej: ?botUsername=test&optionId=5)
    const params = new URLSearchParams(window.location.search);
    const botUsername = params.get("botUsername") || "default_bot";
    const optionId = params.get("optionId") || "1";
    const userId = params.get("userId") || "user_test";

    // Llamar a la API para obtener el DTO
    fetchDataAndRender(botUsername, optionId, userId);

    // Configurar evento para alternar entre Carrusel y Mosaico
    setupViewToggle();
});

async function fetchDataAndRender(botUsername, optionId) {
    try {
        // Concatenamos la URL base con los parámetros exactos que espera tu @RequestParam
        const response = await fetch(`${API_BASE_URL}?botUserName=${botUsername}&optionId=${optionId}`);
        
        if (!response.ok) {
            throw new Error("No se encontró la galería o hubo un error en el servidor");
        }

        const data = await response.json(); 

        renderHeader(data.titulo, data.mensaje);
        renderCarousel(data.urls);
        renderGrid(data.urls);

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("gallery-title").textContent = "Aviso";
        document.getElementById("gallery-message").textContent = "No se pudieron cargar las imágenes en este momento.";
    }
}

function renderHeader(titulo, mensaje) {
    const titleEl = document.getElementById("gallery-title");
    const messageEl = document.getElementById("gallery-message");

    titleEl.textContent = titulo || "Galería de Imágenes";
    messageEl.textContent = mensaje || "";
}

// --- RENDERIZAR CARRUSEL ---
function renderCarousel(urls) {
    const track = document.getElementById("carouselTrack");
    const indicatorsContainer = document.getElementById("carouselIndicators");
    track.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    if (!urls || urls.length === 0) {
        track.innerHTML = "<p style='text-align:center; width:100%; padding-top:140px;'>No hay imágenes disponibles</p>";
        return;
    }

    urls.forEach((url, index) => {
        // Slide
        const slide = document.createElement("li");
        slide.classList.add("carousel-slide");
        if (index === 0) slide.classList.add("current-slide");
        
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Imagen ${index + 1}`;
        img.onclick = () => openModal(url); // Click para ampliar
        
        slide.appendChild(img);
        track.appendChild(slide);

        // Indicador (puntito)
        const dot = document.createElement("button");
        dot.classList.add("indicator");
        if (index === 0) dot.classList.add("current");
        dot.onclick = () => moveToSlide(track, index);
        indicatorsContainer.appendChild(dot);
    });

    setupCarouselNavigation(track);
}

function setupCarouselNavigation(track) {
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const indicators = Array.from(document.getElementById("carouselIndicators").children);
    
    let currentIndex = 0;

    const updateSlidePosition = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        slides.forEach((slide, i) => {
            slide.style.left = `${i * 100}%`;
        });
        indicators.forEach((ind, i) => {
            ind.classList.toggle("current", i === index);
        });
    };

    updateSlidePosition(0);

    nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlidePosition(currentIndex);
    };

    prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlidePosition(currentIndex);
    };
}

// --- RENDERIZAR MOSAICO (GRID) ---
function renderGrid(urls) {
    const grid = document.getElementById("imageGrid");
    grid.innerHTML = "";

    if (!urls || urls.length === 0) return;

    urls.forEach(url => {
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");

        const img = document.createElement("img");
        img.src = url;
        img.alt = "Imagen en mosaico";
        img.onclick = () => openModal(url);

        gridItem.appendChild(img);
        grid.appendChild(gridItem);
    });
}

// --- ALTERNAR VISTAS (Carrusel <-> Mosaico) ---
function setupViewToggle() {
    const toggleSwitch = document.getElementById("viewToggleSwitch");
    const carouselSection = document.getElementById("carousel-section");
    const gridSection = document.getElementById("grid-section");

    toggleSwitch.onchange = () => {
        if (toggleSwitch.checked) {
            // Si está activado (hacia la derecha), muestra el Mosaico
            carouselSection.classList.remove("active");
            gridSection.classList.add("active");
        } else {
            // Si está desactivado (hacia la izquierda), muestra el Carrusel
            gridSection.classList.remove("active");
            carouselSection.classList.add("active");
        }
    };
}

// --- MODAL ZOOM ---
function openModal(url) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.getElementsByClassName("close-modal")[0];

    modal.style.display = "block";
    modalImg.src = url;

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };
}