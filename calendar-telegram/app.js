const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

// 1. Leer el parámetro de la URL para saber qué método usar
const urlParams = new URLSearchParams(window.location.search);
const origin = urlParams.get('origin'); // Valdrá 'inline' o 'reply'

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
      dayDiv.addEventListener('click', () => {
        document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
        dayDiv.classList.add('selected');
        
        selectedDateStr = dateFormatted;

        // Mostrar texto dinámico según el origen para depurar visualmente
        tg.MainButton.setText(`Confirmar (${origin}): ${selectedDateStr}`);
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

// Acción centralizada del MainButton
tg.MainButton.onClick(() => {
  if (!selectedDateStr) {
    alert("No hay fecha seleccionada");
    return;
  }

  if (origin === 'inline') {
    // ----------------------------------------------------
    // FLUJO 1: Botón Inline -> Petición HTTP POST vía Fetch (Ngrok)
    // ----------------------------------------------------
    const payload = {
      initData: tg.initData,
      date: selectedDateStr
    };
    
    fetch('https://rippling-haphazard-tweet.ngrok-free.dev/api/v1/chatbot/business/guardar-fecha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.ok) {
        tg.close();
      } else {
        alert("Error al guardar en el servidor local.");
      }
    })
    .catch(error => {
      console.error("Error de red:", error);
      alert("No se pudo conectar con Ngrok.");
    });

  } else {
    // ----------------------------------------------------
    // FLUJO 2: Teclado Inferior (Reply) -> Envío Nativo a Telegram
    // ----------------------------------------------------
    const payload = JSON.stringify({
      action: "select_date",
      date: selectedDateStr
    });
    
    // AQUÍ ESTÁ LA MAGIA: Esto le dice a Telegram que envíe el WebAppData 
    // a sus servidores para que llegue a tu bot mediante el Webhook / Long Polling.
    tg.sendData(payload); 
  }
});

renderCalendar();