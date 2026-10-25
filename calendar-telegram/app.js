const tg = window.Telegram.WebApp;

// 1. Inicialización obligatoria de Telegram WebApp
tg.ready();
tg.expand();

let currentDate = new Date();
let selectedDateStr = null;

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById('month-year-display').innerText = `${monthNames[month]} ${year}`;

  const grid = document.getElementById('days-grid');
  grid.innerHTML = '';

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.classList.add('day', 'empty');
    grid.appendChild(emptyDiv);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    dayDiv.innerText = day;

    const thisDate = new Date(year, month, day);
    const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add('today');
    }

    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (thisDate < startOfToday) {
      dayDiv.classList.add('disabled');
    } else {
      // Evento al hacer clic en un día válido
      dayDiv.addEventListener('click', () => {
        document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
        dayDiv.classList.add('selected');
        
        // 1. Guardar la fecha seleccionada
        selectedDateStr = dateFormatted;

        // 2. Configurar, activar y mostrar el MainButton nativo
        tg.MainButton.setText(`Confirmar fecha: ${selectedDateStr}`);
        tg.MainButton.enable();
        tg.MainButton.show();
      });
    }

    grid.appendChild(dayDiv);
  }
}

// Navegación de meses
document.getElementById('prev-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Acción del botón principal de Telegram (Declarado FUERA, una sola vez)
tg.MainButton.onClick(() => {
  if (selectedDateStr) {
    const payload = {
      initData: tg.initData, // Vital para la seguridad en tu backend
      date: selectedDateStr
    };
    
    // Petición HTTP POST hacia tu Spring Boot
    fetch('https://rippling-haphazard-tweet.ngrok-free.dev/api/v1/chatbot/business/guardar-fecha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.ok) {
        tg.close(); // Cierra la Mini App al completarse con éxito
      } else {
        alert("Hubo un error al guardar la fecha en el servidor.");
      }
    })
    .catch(error => {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    });
  } else {
    alert("No hay fecha seleccionada");
  }
});

renderCalendar();