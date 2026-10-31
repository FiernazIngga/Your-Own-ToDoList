/* ── Tasks Page JavaScript ── */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────
  let allTasks = [];
  let editingTaskId = null;
  let deletingTaskId = null;
  let searchTimer = null;

  // ── DOM refs ───────────────────────────────────────
  const taskList       = document.getElementById('taskList');
  const emptyState     = document.getElementById('emptyState');
  const loadingSpinner = document.getElementById('loadingSpinner');

  const taskModal      = document.getElementById('taskModal');
  const taskForm       = document.getElementById('taskForm');
  const modalTitle     = document.getElementById('modalTitle');
  const formErrors     = document.getElementById('formErrors');
  const taskIdInput    = document.getElementById('taskId');

  const detailModal    = document.getElementById('detailModal');
  const detailContent  = document.getElementById('detailContent');
  const detailTitle    = document.getElementById('detailModalTitle');

  const confirmModal   = document.getElementById('confirmModal');

  const searchInput    = document.getElementById('searchInput');
  const filterStatus   = document.getElementById('filterStatus');
  const filterPriority = document.getElementById('filterPriority');
  const filterCategory = document.getElementById('filterCategory');
  const sortBy         = document.getElementById('sortBy');

  const categoryList   = document.getElementById('categoryList');

  // ── Helpers ────────────────────────────────────────
  const PRIORITY_LABEL = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' };
  const STATUS_LABEL   = { todo: 'Belum Dikerjakan', in_progress: 'Sedang Dikerjakan', done: 'Selesai' };

  function formatDate(d) {
    if (!d) return '-';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  function isOverdue(task) {
    if (!task.due_date || task.status === 'done') return false;
    const now = new Date();
    const due = task.due_time
      ? new Date(`${task.due_date}T${task.due_time}`)
      : new Date(`${task.due_date}T23:59:59`);
    return due < now;
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── API ────────────────────────────────────────────
  function apiFetch(url, opts) {
    const defaults = { headers: { 'Content-Type': 'application/json' } };
    return fetch(url, Object.assign(defaults, opts));
  }

  function buildQueryParams() {
    const params = new URLSearchParams();
    if (filterStatus.value)   params.set('status', filterStatus.value);
    if (filterPriority.value) params.set('priority', filterPriority.value);
    if (filterCategory.value) params.set('category', filterCategory.value);
    if (searchInput.value.trim()) params.set('q', searchInput.value.trim());
    params.set('sort', sortBy.value);
    params.set('dir', sortBy.value === 'title' ? 'asc' : 'desc');
    return params.toString();
  }

  function loadTasks() {
    loadingSpinner.style.display = 'flex';
    taskList.innerHTML = '';
    emptyState.style.display = 'none';

    apiFetch('/api/tasks?' + buildQueryParams())
      .then(r => r.json())
      .then(tasks => {
        allTasks = tasks;
        loadingSpinner.style.display = 'none';
        renderTasks(tasks);
        loadCategories();
      })
      .catch(() => { loadingSpinner.style.display = 'none'; });
  }

  function loadCategories() {
    apiFetch('/api/categories')
      .then(r => r.json())
      .then(cats => {
        // Update filter dropdown
        const currentVal = filterCategory.value;
        while (filterCategory.options.length > 1) filterCategory.remove(1);
        cats.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c; opt.textContent = c;
          filterCategory.appendChild(opt);
        });
        if (currentVal) filterCategory.value = currentVal;

        // Update datalist in modal
        if (categoryList) {
          categoryList.innerHTML = '';
          cats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            categoryList.appendChild(opt);
          });
        }
      });
  }

  // ── Render ────────────────────────────────────────
  function renderTasks(tasks) {
    if (!tasks.length) {
      emptyState.style.display = 'flex';
      return;
    }
    emptyState.style.display = 'none';
    taskList.innerHTML = tasks.map(taskCardHtml).join('');
    taskList.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.task-check') || e.target.closest('.task-actions')) return;
        openDetail(card.dataset.id);
      });
    });
    taskList.querySelectorAll('.task-check').forEach(chk => {
      chk.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDone(chk.dataset.id, chk.classList.contains('checked'));
      });
    });
    taskList.querySelectorAll('.btn-edit-task').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openEdit(btn.dataset.id);
      });
    });
    taskList.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openConfirmDelete(btn.dataset.id);
      });
    });
  }

  function taskCardHtml(task) {
    const overdue = isOverdue(task);
    const checked = task.status === 'done';
    let cls = `task-card priority-${task.priority} status-${task.status}`;
    if (overdue) cls += ' overdue';

    return `
    <div class="${cls}" data-id="${task.id}">
      <div class="task-check ${checked ? 'checked' : ''}" data-id="${task.id}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="task-body">
        <div class="task-title">${escHtml(task.title)}</div>
        <div class="task-meta">
          ${task.category ? `<span class="task-cat-badge">${escHtml(task.category)}</span>` : ''}
          ${task.due_date ? `<span>📅 ${formatDate(task.due_date)}${task.due_time ? ' ' + task.due_time : ''}</span>` : ''}
          <span class="badge-priority badge-${task.priority}">${PRIORITY_LABEL[task.priority] || task.priority}</span>
          <span class="badge-status badge-${task.status}">${STATUS_LABEL[task.status] || task.status}</span>
          ${overdue ? '<span style="color:var(--danger);font-weight:700">⚠ Terlambat</span>' : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-icon btn-edit-task" data-id="${task.id}" title="Edit" aria-label="Edit">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="btn-icon btn-delete-task" data-id="${task.id}" title="Hapus" aria-label="Hapus" style="color:var(--danger)">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>`;
  }

  // ── Toggle done ───────────────────────────────────
  function toggleDone(id, wasDone) {
    const newStatus = wasDone ? 'todo' : 'done';
    apiFetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    }).then(() => loadTasks());
  }

  // ── Detail Modal ──────────────────────────────────
  function openDetail(id) {
    apiFetch(`/api/tasks/${id}`)
      .then(r => r.json())
      .then(task => {
        detailTitle.textContent = task.title;
        detailContent.innerHTML = `
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="badge-status badge-${task.status}">${STATUS_LABEL[task.status]}</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Prioritas</span>
            <span class="detail-value"><span class="badge-priority badge-${task.priority}">${PRIORITY_LABEL[task.priority]}</span></span>
          </div>
          ${task.category ? `<div class="detail-row"><span class="detail-label">Kategori</span><span class="detail-value">${escHtml(task.category)}</span></div>` : ''}
          <div class="detail-row">
            <span class="detail-label">Tenggat</span>
            <span class="detail-value">${task.due_date ? formatDate(task.due_date) + (task.due_time ? ' ' + task.due_time : '') : '-'}</span>
          </div>
          ${task.description ? `<div class="detail-row"><span class="detail-label">Catatan</span><span class="detail-value detail-desc">${escHtml(task.description)}</span></div>` : ''}
          <div class="detail-row">
            <span class="detail-label">Dibuat</span>
            <span class="detail-value">${task.created_at ? task.created_at.slice(0,10) : '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Diperbarui</span>
            <span class="detail-value">${task.updated_at ? task.updated_at.slice(0,10) : '-'}</span>
          </div>
        `;
        document.getElementById('detailEditBtn').dataset.id = id;
        document.getElementById('detailDeleteBtn').dataset.id = id;
        detailModal.style.display = 'flex';
      });
  }

  document.getElementById('detailModalClose').addEventListener('click', () => detailModal.style.display = 'none');
  document.getElementById('detailEditBtn').addEventListener('click', function () {
    detailModal.style.display = 'none';
    openEdit(this.dataset.id);
  });
  document.getElementById('detailDeleteBtn').addEventListener('click', function () {
    detailModal.style.display = 'none';
    openConfirmDelete(this.dataset.id);
  });

  // ── Create / Edit Modal ───────────────────────────
  function openCreate() {
    editingTaskId = null;
    modalTitle.textContent = 'Tugas Baru';
    taskForm.reset();
    formErrors.style.display = 'none';
    taskIdInput.value = '';
    taskModal.style.display = 'flex';
    document.getElementById('taskTitle').focus();
  }

  function openEdit(id) {
    apiFetch(`/api/tasks/${id}`)
      .then(r => r.json())
      .then(task => {
        editingTaskId = id;
        modalTitle.textContent = 'Edit Tugas';
        formErrors.style.display = 'none';
        taskIdInput.value = id;
        document.getElementById('taskTitle').value    = task.title || '';
        document.getElementById('taskDesc').value     = task.description || '';
        document.getElementById('taskCategory').value = task.category || '';
        document.getElementById('taskPriority').value = task.priority || 'medium';
        document.getElementById('taskDueDate').value  = task.due_date || '';
        document.getElementById('taskDueTime').value  = task.due_time || '';
        document.getElementById('taskStatus').value   = task.status || 'todo';
        taskModal.style.display = 'flex';
        document.getElementById('taskTitle').focus();
      });
  }

  document.getElementById('modalClose').addEventListener('click',     () => taskModal.style.display = 'none');
  document.getElementById('modalCancelBtn').addEventListener('click', () => taskModal.style.display = 'none');

  taskModal.addEventListener('click', function (e) {
    if (e.target === taskModal) taskModal.style.display = 'none';
  });
  detailModal.addEventListener('click', function (e) {
    if (e.target === detailModal) detailModal.style.display = 'none';
  });

  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    formErrors.style.display = 'none';
    const data = {
      title:       document.getElementById('taskTitle').value,
      description: document.getElementById('taskDesc').value,
      category:    document.getElementById('taskCategory').value,
      priority:    document.getElementById('taskPriority').value,
      due_date:    document.getElementById('taskDueDate').value,
      due_time:    document.getElementById('taskDueTime').value,
      status:      document.getElementById('taskStatus').value,
    };

    const url    = editingTaskId ? `/api/tasks/${editingTaskId}` : '/api/tasks';
    const method = editingTaskId ? 'PUT' : 'POST';

    apiFetch(url, { method, body: JSON.stringify(data) })
      .then(r => r.json().then(body => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) {
          const errs = Array.isArray(body.error) ? body.error : [body.error];
          formErrors.innerHTML = errs.map(e => `<div>${escHtml(e)}</div>`).join('');
          formErrors.style.display = 'block';
          return;
        }
        taskModal.style.display = 'none';
        loadTasks();
      });
  });

  // ── Delete ────────────────────────────────────────
  function openConfirmDelete(id) {
    deletingTaskId = id;
    confirmModal.style.display = 'flex';
  }

  document.getElementById('confirmCancelBtn').addEventListener('click', () => {
    confirmModal.style.display = 'none';
    deletingTaskId = null;
  });
  document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    if (!deletingTaskId) return;
    apiFetch(`/api/tasks/${deletingTaskId}`, { method: 'DELETE' })
      .then(() => {
        confirmModal.style.display = 'none';
        deletingTaskId = null;
        loadTasks();
      });
  });
  confirmModal.addEventListener('click', function (e) {
    if (e.target === confirmModal) { confirmModal.style.display = 'none'; deletingTaskId = null; }
  });

  // ── Filter / Search ───────────────────────────────
  searchInput.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadTasks, 300);
  });
  [filterStatus, filterPriority, filterCategory, sortBy].forEach(el => {
    el.addEventListener('change', loadTasks);
  });

  // ── New Task buttons ──────────────────────────────
  document.getElementById('btnNewTask').addEventListener('click', openCreate);
  const btnEmpty = document.getElementById('btnEmptyNewTask');
  if (btnEmpty) btnEmpty.addEventListener('click', openCreate);

  // ── Init ──────────────────────────────────────────
  loadTasks();
})();
