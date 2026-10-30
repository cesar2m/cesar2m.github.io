// URL base de tu backend a través de Ngrok
const API_BASE_URL = "https://rippling-haphazard-tweet.ngrok-free.dev/api/v1/chatbot/imageGallery";

document.addEventListener("DOMContentLoaded", () => {
    console.log("=== INICIANDO MINI APP DE GALERÍA ===");
    
    // Capturar parámetros de la URL enviados por el bot de Telegram
    const params = new URLSearchParams(window.location.search);
    const botUserName = params.get("botUserName") || params.get("botUsername") || "default_bot";
    const optionId = params.get("optionId") || "1";

    console.log("Parámetros extraídos de la URL:", {
        botUserName: botUserName,
        optionId: optionId,
        urlCompleta: window.location.href
    });

    // Validar si los parámetros mínimos están presentes
    if (!botUserName || !optionId) {
        alert("Atención: Faltan parámetros en la URL (botUserName u optionId).");
    }

    // Llamar a la API para obtener el DTO
    fetchDataAndRender(botUserName, optionId);

    // Configurar evento para el switch de vistas
    setupViewToggle();
});

async function fetchDataAndRender(botUserName, optionId) {
    // Construimos la URL exacta con los parámetros que exige tu @RequestParam en Java
    const targetUrl = `${API_BASE_URL}?botUserName=${encodeURIComponent(botUserName)}&optionId=${encodeURIComponent(optionId)}`;
    
    console.log("--> Disparando petición FETCH a:", targetUrl);

    try {
        const response = await fetch(targetUrl);
        
        console.log("<- Respuesta del servidor recibida. Status:", response.status, response.statusText);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("El servidor respondió con un error:", errorBody);
            throw new Error(`Error HTTP: ${response.status} (${response.statusText})`);
        }

        const data = await response.json(); 
        console.log("✅ DTO recibido exitosamente del backend:", data);

        // Renderizar elementos en pantalla
        renderHeader(data.titulo, data.mensaje);
        renderCarousel(data.urls);
        renderGrid(data.urls);

    } catch (error) {
        console.error("❌ EXCEPCIÓN EN LA PETICIÓN FETCH:", error);
        
        // Alerta visible en pantalla para identificar el problema de inmediato en el móvil
        alert("No se pudo conectar con el backend.\nDetalle: " + error.message + "\n\nVerifica que ngrok esté activo y hayas aceptado la advertencia en el navegador del celular.");

        document.getElementById("gallery-title").textContent = "Sin conexión al servidor";
        document.getElementById("gallery-message").textContent = "Revisa la consola o asegúrate de que ngrok esté corriendo.";
    }
}

function renderHeader(titulo, mensaje) {
    console.log("Renderizando encabezado -> Título:", titulo, "| Mensaje:", mensaje);
    const titleEl = document.getElementById("gallery-title");
    const messageEl = document.getElementById("gallery-message");

    titleEl.textContent = titulo || "Galería de Imágenes";
    messageEl.textContent = mensaje || "";
}

// --- RENDERIZAR CARRUSEL ---
function renderCarousel(urls) {
    console.log("Renderizando Carrusel. URLs recibidas:", urls);
    const track = document.getElementById("carouselTrack");
    const indicatorsContainer = document.getElementById("carouselIndicators");
    track.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    if (!urls || urls.length === 0) {
        console.warn("La lista de URLs está vacía.");
        track.innerHTML = "<p style='text-align:center; width:100%; padding-top:140px;'>No hay imágenes disponibles</p>";
        return;
    }

    urls.forEach((url, index) => {
        const slide = document.createElement("li");
        slide.classList.add("carousel-slide");
        if (index === 0) slide.classList.add("current-slide");
        
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Imagen ${index + 1}`;
        img.onclick = () => openModal(url);
        
        slide.appendChild(img);
        track.appendChild(slide);

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
    console.log("Renderizando Mosaico con URLs:", urls);
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

// --- ALTERNAR VISTAS CON EL SWITCH ---
function setupViewToggle() {
    const toggleSwitch = document.getElementById("viewToggleSwitch");
    const carouselSection = document.getElementById("carousel-section");
    const gridSection = document.getElementById("grid-section");

    if (!toggleSwitch) return;

    toggleSwitch.onchange = () => {
        console.log("Cambiando vista mediante switch. Modo Mosaico activado:", toggleSwitch.checked);
        if (toggleSwitch.checked) {
            carouselSection.classList.remove("active");
            gridSection.classList.add("active");
        } else {
            gridSection.classList.remove("active");
            carouselSection.classList.add("active");
        }
    };
}

// --- MODAL ZOOM ---
function openModal(url) {
    console.log("Abriendo imagen en modal:", url);
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