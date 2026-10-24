const tg = window.Telegram.WebApp;

// Expande la Mini App para usar la pantalla completa
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

  // Ajustar el índice para que Lunes sea el primer día (0: Lun, 6: Dom)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Rellenar espacios vacíos al inicio del mes
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.classList.add('day', 'empty');
    grid.appendChild(emptyDiv);
  }

  // Días del mes
  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    dayDiv.innerText = day;

    const thisDate = new Date(year, month, day);
    const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Marcar si es el día de hoy
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add('today');
    }

    // Deshabilitar fechas pasadas (opcional)
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (thisDate < startOfToday) {
      dayDiv.classList.add('disabled');
    } else {
      // Evento de selección
      dayDiv.addEventListener('click', () => {
        document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
        dayDiv.classList.add('selected');
        selectedDateStr = dateFormatted;

        // Configurar y mostrar el MainButton nativo de Telegram abajo
        tg.MainButton.setText(`Confirmar fecha: ${selectedDateStr}`);
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

// Acción al presionar el botón de enviar en Telegram
tg.MainButton.onClick(() => {
  if (selectedDateStr) {
    const payload = JSON.stringify({
      action: "select_date",
      date: selectedDateStr
    });
    
    alert("Intentando enviar: " + payload); // <--- Esto te dirá si el botón realmente reaccionó al clic
    tg.sendData(payload); 
  } else {
    alert("No hay fecha seleccionada");
  }
});

renderCalendar();