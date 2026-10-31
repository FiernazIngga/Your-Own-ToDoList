// Mini Calendar for Dashboard
document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('miniCalendar');
  if (!container) return;

  let current = new Date();
  let taskDates = new Set();

  function fetchTaskDates(year, month) {
    fetch('/api/calendar/tasks?year=' + year + '&month=' + month)
      .then(r => r.json())
      .then(tasks => {
        taskDates = new Set(tasks.map(t => t.due_date));
        render();
      });
  }

  function render() {
    const year  = current.getFullYear();
    const month = current.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni',
                        'Juli','Agustus','September','Oktober','November','Desember'];
    const dayNames = ['M','S','S','R','K','J','S'];

    let startDow = firstDay.getDay(); // 0=Sun
    // Adjust to Mon-first
    startDow = (startDow === 0) ? 6 : startDow - 1;

    let html = '<div class="mini-cal-header">';
    html += '<button class="btn-icon" id="miniPrev" style="width:22px;height:22px;font-size:.8rem">‹</button>';
    html += '<span class="mini-cal-title">' + monthNames[month] + ' ' + year + '</span>';
    html += '<button class="btn-icon" id="miniNext" style="width:22px;height:22px;font-size:.8rem">›</button>';
    html += '</div>';
    html += '<div class="mini-cal-grid">';

    ['Sen','Sel','Rab','Kam','Jum','Sab','Min'].forEach(d => {
      html += '<div class="mini-cal-day-name">' + d + '</div>';
    });

    // Empty cells before first
    for (let i = 0; i < startDow; i++) {
      html += '<div class="mini-cal-cell other-month"></div>';
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
      const hasTask = taskDates.has(dateStr);
      let cls = 'mini-cal-cell current-month';
      if (isToday) cls += ' today';
      if (hasTask) cls += ' has-tasks';
      html += '<div class="' + cls + '">' + d + '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    document.getElementById('miniPrev').addEventListener('click', function () {
      current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
      fetchTaskDates(current.getFullYear(), current.getMonth() + 1);
    });
    document.getElementById('miniNext').addEventListener('click', function () {
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      fetchTaskDates(current.getFullYear(), current.getMonth() + 1);
    });
  }

  fetchTaskDates(current.getFullYear(), current.getMonth() + 1);
});
