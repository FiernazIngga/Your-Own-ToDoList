/* ── Calendar Page JavaScript ── */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────
  let currentDate  = new Date();
  let currentView  = 'month';
  let allTasks     = [];
  let deletingId   = null;

  // ── DOM refs ───────────────────────────────────────
  const calGrid    = document.getElementById('calendarGrid');
  const calTitle   = document.getElementById('calTitle');
  const calPrev    = document.getElementById('calPrev');
  const calNext    = document.getElementById('calNext');
  const calToday   = document.getElementById('calToday');
  const viewBtns   = document.querySelectorAll('.view-btn');

  const detailModal  = document.getElementById('calDetailModal');
  const detailTitle  = document.getElementById('calDetailTitle');
  const detailContent= document.getElementById('calDetailContent');
  const detailClose  = document.getElementById('calDetailClose');
  const detailEdit   = document.getElementById('calDetailEdit');
  const detailDelete = document.getElementById('calDetailDelete');

  const editModal    = document.getElementById('calEditModal');
  const editForm     = document.getElementById('calEditForm');
  const editClose    = document.getElementById('calEditClose');
  const editCancel   = document.getElementById('calEditCancel');
  const editErrors   = document.getElementById('calEditErrors');

  const confirmModal = document.getElementById('calConfirmModal');
  const confirmCancel= document.getElementById('calConfirmCancel');
  const confirmDelete= document.getElementById('calConfirmDelete');

  // ── Helpers ────────────────────────────────────────
  const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni',
                       'Juli','Agustus','September','Oktober','November','Desember'];
  const DAY_NAMES   = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const PRIORITY_LABEL = { high:'Tinggi', medium:'Sedang', low:'Rendah' };
  const STATUS_LABEL   = { todo:'Belum Dikerjakan', in_progress:'Sedang Dikerjakan', done:'Selesai' };

  function pad(n) { return String(n).padStart(2,'0'); }
  function toDateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function isOverdue(t) {
    if (!t.due_date || t.status === 'done') return false;
    const now = new Date();
    const due = t.due_time
      ? new Date(`${t.due_date}T${t.due_time}`)
      : new Date(`${t.due_date}T23:59:59`);
    return due < now;
  }
  function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function formatDate(d) {
    if (!d) return '-';
    const [y,m,day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  // ── Fetch tasks for current view ──────────────────
  function fetchTasks() {
    let url = '/api/calendar/tasks/range?';
    if (currentView === 'month') {
      const y = currentDate.getFullYear(), m = currentDate.getMonth();
      const start = `${y}-${pad(m+1)}-01`;
      const lastD = new Date(y, m+1, 0).getDate();
      const end   = `${y}-${pad(m+1)}-${pad(lastD)}`;
      url += `start=${start}&end=${end}`;
    } else if (currentView === 'week') {
      const dow = currentDate.getDay();
      const mon = new Date(currentDate); mon.setDate(currentDate.getDate() - ((dow===0?7:dow)-1));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      url += `start=${toDateStr(mon)}&end=${toDateStr(sun)}`;
    } else {
      const ds = toDateStr(currentDate);
      url += `start=${ds}&end=${ds}`;
    }

    fetch(url)
      .then(r => r.json())
      .then(tasks => { allTasks = tasks; render(); });
  }

  // ── Tasks by date map ─────────────────────────────
  function tasksByDate() {
    const map = {};
    allTasks.forEach(t => {
      if (!map[t.due_date]) map[t.due_date] = [];
      map[t.due_date].push(t);
    });
    return map;
  }

  // ── Render dispatcher ─────────────────────────────
  function render() {
    if (currentView === 'month') renderMonth();
    else if (currentView === 'week') renderWeek();
    else renderDay();
  }

  // ── Month View ────────────────────────────────────
  function renderMonth() {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    calTitle.textContent = `${MONTH_NAMES[m]} ${y}`;

    const firstDay = new Date(y, m, 1);
    const lastDay  = new Date(y, m+1, 0);
    const today    = new Date();
    const todayStr = toDateStr(today);
    const tbd      = tasksByDate();

    let dow = firstDay.getDay();
    let startDow = (dow === 0) ? 6 : dow - 1;

    let html = '<div class="cal-month-header">';
    DAY_NAMES.forEach(d => { html += `<div class="cal-month-dayname">${d}</div>`; });
    html += '</div><div class="cal-month-body">';

    // cells before month
    const prevLastDay = new Date(y, m, 0);
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevLastDay.getDate() - i;
      html += `<div class="cal-month-cell other-month"><span class="cal-date-num">${d}</span></div>`;
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${y}-${pad(m+1)}-${pad(d)}`;
      const isToday = dateStr === todayStr;
      let cls = 'cal-month-cell';
      if (isToday) cls += ' today';
      const dayTasks = tbd[dateStr] || [];
      html += `<div class="${cls}" data-date="${dateStr}">`;
      html += `<span class="cal-date-num">${d}</span>`;
      const visible = dayTasks.slice(0, 3);
      visible.forEach(t => {
        const over = isOverdue(t);
        let chipCls = `cal-task-chip priority-${t.priority} status-${t.status}`;
        if (over) chipCls += ' overdue';
        const time = t.due_time ? ` ${t.due_time}` : '';
        html += `<span class="${chipCls}" data-id="${t.id}">${escHtml(t.title)}${time}</span>`;
      });
      if (dayTasks.length > 3) {
        html += `<span class="cal-more" data-date="${dateStr}">+${dayTasks.length - 3} lagi</span>`;
      }
      html += '</div>';
    }

    // trailing cells
    const total = startDow + lastDay.getDate();
    const trailing = (7 - (total % 7)) % 7;
    for (let d = 1; d <= trailing; d++) {
      html += `<div class="cal-month-cell other-month"><span class="cal-date-num">${d}</span></div>`;
    }
    html += '</div>';
    calGrid.innerHTML = html;

    calGrid.querySelectorAll('.cal-task-chip').forEach(chip => {
      chip.addEventListener('click', e => { e.stopPropagation(); openDetail(chip.dataset.id); });
    });
  }

  // ── Week View ─────────────────────────────────────
  function renderWeek() {
    const dow = currentDate.getDay();
    const mon = new Date(currentDate);
    mon.setDate(currentDate.getDate() - ((dow === 0 ? 7 : dow) - 1));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      days.push(d);
    }

    const today    = new Date();
    const todayStr = toDateStr(today);
    const tbd      = tasksByDate();

    calTitle.textContent = `${DAY_NAMES[0]} ${pad(mon.getDate())} – ${DAY_NAMES[6]} ${pad(days[6].getDate())} ${MONTH_NAMES[days[6].getMonth()]} ${days[6].getFullYear()}`;

    let html = '<table class="cal-week-table" style="width:100%;border-collapse:collapse">';
    // Header row
    html += '<thead><tr><th style="width:60px;border-bottom:1px solid var(--border)"></th>';
    days.forEach(d => {
      const ds = toDateStr(d);
      const isT = ds === todayStr;
      html += `<th class="cal-week-day-header${isT?' today':''}" style="border-bottom:1px solid var(--border);text-align:center;padding:8px 4px;font-size:.78rem;font-weight:700">
        ${DAY_NAMES[(d.getDay()+6)%7]}<br>${pad(d.getDate())}
      </th>`;
    });
    html += '</tr></thead><tbody>';

    // All-day row
    html += '<tr><td style="font-size:.68rem;color:var(--text-muted);padding:6px 8px;border-bottom:1px solid var(--border-light);vertical-align:top">Tugas</td>';
    days.forEach(d => {
      const ds = toDateStr(d);
      const dayTasks = tbd[ds] || [];
      html += `<td style="border-left:1px solid var(--border-light);border-bottom:1px solid var(--border-light);padding:4px;vertical-align:top;min-height:48px">`;
      dayTasks.forEach(t => {
        const over = isOverdue(t);
        let chipCls = `cal-task-chip priority-${t.priority} status-${t.status}`;
        if (over) chipCls += ' overdue';
        const time = t.due_time ? ` ${t.due_time}` : '';
        html += `<span class="${chipCls}" data-id="${t.id}" style="display:block;margin-bottom:3px">${escHtml(t.title)}${time}</span>`;
      });
      html += '</td>';
    });
    html += '</tr>';

    html += '</tbody></table>';
    calGrid.innerHTML = html;

    calGrid.querySelectorAll('.cal-task-chip').forEach(chip => {
      chip.addEventListener('click', e => { e.stopPropagation(); openDetail(chip.dataset.id); });
    });
  }

  // ── Day View ──────────────────────────────────────
  function renderDay() {
    const ds   = toDateStr(currentDate);
    const tbd  = tasksByDate();
    const today= toDateStr(new Date());

    const dayLabel = `${DAY_NAMES[(currentDate.getDay()+6)%7]}, ${currentDate.getDate()} ${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    calTitle.textContent = dayLabel;

    const dayTasks = (tbd[ds] || []).slice().sort((a,b) => (a.due_time||'').localeCompare(b.due_time||''));

    let html = `<div class="cal-day-header">${dayLabel}${ds===today?' (Hari Ini)':''}</div>`;

    if (dayTasks.length === 0) {
      html += '<div class="empty-state-small" style="padding:40px">Tidak ada tugas pada hari ini.</div>';
    } else {
      dayTasks.forEach(t => {
        const over = isOverdue(t);
        let chipCls = `cal-task-chip priority-${t.priority} status-${t.status}`;
        if (over) chipCls += ' overdue';
        html += `<div class="cal-day-slot">
          <div class="cal-day-time">${t.due_time || '—'}</div>
          <div class="cal-day-events">
            <span class="${chipCls}" data-id="${t.id}" style="display:inline-block">${escHtml(t.title)}</span>
          </div>
        </div>`;
      });
    }
    calGrid.innerHTML = html;

    calGrid.querySelectorAll('.cal-task-chip').forEach(chip => {
      chip.addEventListener('click', e => { e.stopPropagation(); openDetail(chip.dataset.id); });
    });
  }

  // ── Detail Modal ──────────────────────────────────
  function openDetail(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;
    detailTitle.textContent = task.title;
    detailContent.innerHTML = `
      <div class="detail-row"><span class="detail-label">Status</span>
        <span class="detail-value"><span class="badge-status badge-${task.status}">${STATUS_LABEL[task.status]}</span></span></div>
      <div class="detail-row"><span class="detail-label">Prioritas</span>
        <span class="detail-value"><span class="badge-priority badge-${task.priority}">${PRIORITY_LABEL[task.priority]}</span></span></div>
      ${task.category ? `<div class="detail-row"><span class="detail-label">Kategori</span><span class="detail-value">${escHtml(task.category)}</span></div>` : ''}
      <div class="detail-row"><span class="detail-label">Tenggat</span>
        <span class="detail-value">${task.due_date ? formatDate(task.due_date) + (task.due_time ? ' ' + task.due_time : '') : '-'}</span></div>
      ${task.description ? `<div class="detail-row"><span class="detail-label">Catatan</span><span class="detail-value detail-desc">${escHtml(task.description)}</span></div>` : ''}
    `;
    detailEdit.dataset.id   = id;
    detailDelete.dataset.id = id;
    detailModal.style.display = 'flex';
  }

  detailClose.addEventListener('click',  () => detailModal.style.display = 'none');
  detailModal.addEventListener('click',  e => { if (e.target === detailModal) detailModal.style.display = 'none'; });

  detailEdit.addEventListener('click', function () {
    detailModal.style.display = 'none';
    openEdit(this.dataset.id);
  });
  detailDelete.addEventListener('click', function () {
    detailModal.style.display = 'none';
    openConfirmDelete(this.dataset.id);
  });

  // ── Edit Modal ────────────────────────────────────
  function openEdit(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;
    document.getElementById('calEditId').value       = id;
    document.getElementById('calEditTitle').value    = task.title || '';
    document.getElementById('calEditDesc').value     = task.description || '';
    document.getElementById('calEditCategory').value = task.category || '';
    document.getElementById('calEditPriority').value = task.priority || 'medium';
    document.getElementById('calEditDueDate').value  = task.due_date || '';
    document.getElementById('calEditDueTime').value  = task.due_time || '';
    document.getElementById('calEditStatus').value   = task.status || 'todo';
    editErrors.style.display = 'none';
    editModal.style.display  = 'flex';
  }

  editClose.addEventListener('click',  () => editModal.style.display = 'none');
  editCancel.addEventListener('click', () => editModal.style.display = 'none');
  editModal.addEventListener('click',  e => { if (e.target === editModal) editModal.style.display = 'none'; });

  editForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('calEditId').value;
    const data = {
      title:       document.getElementById('calEditTitle').value,
      description: document.getElementById('calEditDesc').value,
      category:    document.getElementById('calEditCategory').value,
      priority:    document.getElementById('calEditPriority').value,
      due_date:    document.getElementById('calEditDueDate').value,
      due_time:    document.getElementById('calEditDueTime').value,
      status:      document.getElementById('calEditStatus').value,
    };
    fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(r => r.json().then(b => ({ ok: r.ok, b })))
      .then(({ ok, b }) => {
        if (!ok) {
          const errs = Array.isArray(b.error) ? b.error : [b.error];
          editErrors.innerHTML = errs.map(e => `<div>${escHtml(e)}</div>`).join('');
          editErrors.style.display = 'block';
          return;
        }
        editModal.style.display = 'none';
        fetchTasks();
      });
  });

  // ── Delete ────────────────────────────────────────
  function openConfirmDelete(id) {
    deletingId = id;
    confirmModal.style.display = 'flex';
  }
  confirmCancel.addEventListener('click', () => { confirmModal.style.display = 'none'; deletingId = null; });
  confirmModal.addEventListener('click',  e => { if (e.target === confirmModal) { confirmModal.style.display = 'none'; deletingId = null; } });
  confirmDelete.addEventListener('click', () => {
    if (!deletingId) return;
    fetch(`/api/tasks/${deletingId}`, { method: 'DELETE' })
      .then(() => { confirmModal.style.display = 'none'; deletingId = null; fetchTasks(); });
  });

  // ── Navigation ────────────────────────────────────
  calPrev.addEventListener('click', () => {
    if (currentView === 'month') currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    else if (currentView === 'week') currentDate = new Date(currentDate.getTime() - 7 * 86400000);
    else currentDate = new Date(currentDate.getTime() - 86400000);
    fetchTasks();
  });
  calNext.addEventListener('click', () => {
    if (currentView === 'month') currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    else if (currentView === 'week') currentDate = new Date(currentDate.getTime() + 7 * 86400000);
    else currentDate = new Date(currentDate.getTime() + 86400000);
    fetchTasks();
  });
  calToday.addEventListener('click', () => { currentDate = new Date(); fetchTasks(); });

  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      fetchTasks();
    });
  });

  // ── Init ──────────────────────────────────────────
  fetchTasks();
})();
