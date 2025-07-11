const API_URL = "/api";
let projects = [];
let tasks = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchProjects();
  fetchTasks();
  setupModal();
  setupProjectModal();
  setupFABs();
});

// ------------------------- PROJECTS DASHBOARD CARDS -------------------------
function displayProjectSection() {
  const section = document.getElementById('projectSection');
  if (!section) return;
  section.innerHTML = projects.length
    ? projects.map(project => `
      <div class="bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-6 transition-transform hover:scale-105">
        <div class="flex justify-between items-center mb-3">
          <span class="text-lg font-semibold">${project.name}</span>
          <span class="text-xs px-2 py-1 rounded-full ${
            project.status === "ACTIVE"
              ? "bg-green-700/40 text-green-300"
              : "bg-gray-700/60 text-gray-200"
          }">${formatStatus(project.status)}</span>
        </div>
        <div class="flex justify-between mt-5">
          <button onclick="openProjectModal(${project.id})"
            class="px-4 py-1 bg-gradient-to-r from-green-500 to-teal-400 text-white rounded-xl font-bold shadow hover:scale-105 transition-transform">Edit</button>
          <button onclick="deleteProject(${project.id})"
            class="px-4 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow hover:scale-105 transition-transform">Delete</button>
        </div>
      </div>
    `).join('')
    : `<div class="col-span-3 text-gray-400 text-center">No projects yet. Click 'Add Project' to get started.</div>`;
}
// ---------------------------------------------------------------------------

function fetchProjects() {
  fetch(`${API_URL}/projects`)
    .then(res => res.json())
    .then(data => {
      projects = data;
      populateProjectDropdown();
      populateProjectFilter();
      displayProjectSection(); // Dashboard cards grid!
    });
}

function fetchTasks() {
  fetch(`${API_URL}/tasks`)
    .then(res => res.json())
    .then(data => {
      tasks = data;
      displayTasks();
      updateDashboardSummary();
      drawChart();
    });
}

function populateProjectDropdown() {
  const select = document.getElementById('taskProject');
  if (!select) return;
  select.innerHTML = projects.map(p =>
    `<option value="${p.id}">${p.name}</option>`
  ).join('');
}

function populateProjectFilter() {
  const filter = document.getElementById('projectFilter');
  if (!filter) return;
  filter.innerHTML = `<option value="">All Projects</option>` +
    projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

// ------------ TASK MANAGEMENT ----------------

function displayTasks() {
  const projectId = document.getElementById('projectFilter').value;
  const status = document.getElementById('statusFilter').value;
  const sort = document.getElementById('sortOption').value;

  let filtered = [...tasks];
  if (projectId) filtered = filtered.filter(t => t.project && t.project.id == projectId);
  if (status) filtered = filtered.filter(t => t.status === status);

  if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else filtered.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  const taskList = document.getElementById('taskList');
  taskList.innerHTML = filtered.length ? filtered.map(task => `
    <div class="bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold mb-1">${task.title}</h2>
        <p class="text-gray-300 text-sm mb-2">${task.description || ""}</p>
        <div class="text-xs flex gap-3 flex-wrap">
          <span class="px-2 py-1 rounded-full ${statusColor(task.status)}">${formatStatus(task.status)}</span>
          <span class="text-gray-400">Due: ${task.dueDate || '-'}</span>
          <span class="text-gray-400">Project: ${task.project ? task.project.name : '-'}</span>
        </div>
      </div>
      <div class="flex gap-2 mt-3 md:mt-0">
        <button onclick="openTaskModal(${task.id})" class="px-4 py-1 bg-gradient-to-r from-green-500 to-teal-400 text-white rounded-xl font-bold shadow hover:scale-105 transition-transform">Edit</button>
        <button onclick="deleteTask(${task.id})" class="px-4 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow hover:scale-105 transition-transform">Delete</button>
      </div>
    </div>
  `).join('') : `<div class="text-gray-400">No tasks found.</div>`;
}

function statusColor(status) {
  switch (status) {
    case "PENDING": return "bg-yellow-700/60 text-yellow-200";
    case "IN_PROGRESS": return "bg-blue-700/60 text-blue-200";
    case "COMPLETED": return "bg-green-700/60 text-green-200";
    case "ACTIVE": return "bg-green-700/40 text-green-200";
    case "ARCHIVED": return "bg-gray-700/60 text-gray-300";
    default: return "bg-gray-700/60 text-gray-300";
  }
}

function formatStatus(status) {
  switch (status) {
    case "PENDING": return "Pending";
    case "IN_PROGRESS": return "In Progress";
    case "COMPLETED": return "Completed";
    case "ACTIVE": return "Active";
    case "ARCHIVED": return "Archived";
    default: return status;
  }
}

// Filtering and sorting listeners
['projectFilter', 'statusFilter', 'sortOption'].forEach(id =>
  document.getElementById(id).addEventListener('change', displayTasks)
);

// --- Task Modal setup ---
function setupModal() {
  document.getElementById('addTaskBtn').onclick = () => openTaskModal();
  document.getElementById('closeModalBtn').onclick = () => closeTaskModal();
  document.getElementById('cancelBtn').onclick = () => closeTaskModal();
  document.getElementById('fabAddTask').onclick = () => openTaskModal();
  document.getElementById('taskForm').onsubmit = submitTaskForm;
}

function openTaskModal(taskId) {
  const form = document.getElementById('taskForm');
  document.getElementById('modalTitle').innerText = taskId ? "Edit Task" : "Add Task";
  form.reset();
  document.getElementById('taskId').value = '';
  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description || '';
      document.getElementById('taskStatus').value = task.status;
      document.getElementById('taskDueDate').value = task.dueDate || '';
      document.getElementById('taskProject').value = task.project ? task.project.id : '';
    }
  }
  animateModal('taskModal');
}

function closeTaskModal() { closeModal('taskModal'); }

function submitTaskForm(event) {
  event.preventDefault();
  const id = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const status = document.getElementById('taskStatus').value;
  const dueDate = document.getElementById('taskDueDate').value;
  const projectId = document.getElementById('taskProject').value;

  const taskData = {
    title, description, status, dueDate,
    project: projectId ? { id: projectId } : null
  };

  const url = id ? `${API_URL}/tasks/${id}` : `${API_URL}/tasks`;
  const method = id ? "PUT" : "POST";

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  })
  .then(res => res.json())
  .then(data => {
    fetchTasks();
    closeTaskModal();
  });
}

// Delete task with confirmation
function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" })
    .then(() => fetchTasks());
}

// Dashboard summary and chart
function updateDashboardSummary() {
  const summary = document.getElementById('dashboard-summary');
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === "PENDING").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter(t => t.status === "COMPLETED").length;

  summary.innerHTML = `
    <div class="bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl px-4 py-3 text-center">
      <div class="text-2xl font-bold">${total}</div>
      <div class="text-xs text-gray-300">Total Tasks</div>
    </div>
    <div class="bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl px-4 py-3 text-center">
      <div class="text-2xl font-bold text-amber-400">${pending}</div>
      <div class="text-xs text-amber-200">Pending</div>
    </div>
    <div class="bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl px-4 py-3 text-center">
      <div class="text-2xl font-bold text-blue-400">${inProgress}</div>
      <div class="text-xs text-blue-200">In Progress</div>
    </div>
    <div class="bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl px-4 py-3 text-center">
      <div class="text-2xl font-bold text-green-400">${completed}</div>
      <div class="text-xs text-green-200">Completed</div>
    </div>
  `;
}

// Chart.js
let chart;
function drawChart() {
  const ctx = document.getElementById('dashboardChart').getContext('2d');
  const pending = tasks.filter(t => t.status === "PENDING").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter(t => t.status === "COMPLETED").length;
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [{
        data: [pending, inProgress, completed],
        backgroundColor: [
          'rgba(245, 158, 11, 0.9)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(34,197,94,0.85)'
        ]
      }]
    },
    options: {
      plugins: { legend: { labels: { color: "white", font: { weight: "bold" } } } },
      cutout: "70%"
    }
  });
}

// Floating Action Buttons for mobile
function setupFABs() {
  if (document.getElementById('fabAddProject')) {
    document.getElementById('fabAddProject').onclick = () => openProjectModal();
  }
  if (document.getElementById('fabAddTask')) {
    document.getElementById('fabAddTask').onclick = () => openTaskModal();
  }
}

// Modern modal animation helpers
function animateModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove("hidden");
  const inner = modal.querySelector("div");
  inner.classList.remove("modal-hidden");
  inner.classList.add("modal-active");
  setTimeout(() => inner.classList.remove('opacity-0'), 10);
  // Autofocus first input
  setTimeout(() => {
    const input = inner.querySelector("input:not([type=hidden]),select,textarea");
    if (input) input.focus();
  }, 150);
}
function closeModal(id) {
  const modal = document.getElementById(id);
  const inner = modal.querySelector("div");
  inner.classList.remove("modal-active");
  inner.classList.add("modal-hidden");
  setTimeout(() => { modal.classList.add("hidden"); }, 180);
}

// PROJECT MODAL
function setupProjectModal() {
  document.getElementById('addProjectBtn').onclick = () => openProjectModal();
  document.getElementById('closeProjectModalBtn').onclick = () => closeProjectModal();
  document.getElementById('cancelProjectBtn').onclick = () => closeProjectModal();
  document.getElementById('fabAddProject').onclick = () => openProjectModal();

  document.getElementById('projectForm').onsubmit = function(e) {
    e.preventDefault();
    const id = document.getElementById('projectId').value;
    const name = document.getElementById('projectName').value;
    const status = document.getElementById('projectStatus') ? document.getElementById('projectStatus').value : "ACTIVE";
    const projectData = { name, status };
    const url = id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;
    const method = id ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(projectData)
    })
    .then(res => res.json())
    .then(data => {
      fetchProjects();
      closeProjectModal();
    });
  };
}
function openProjectModal(projectId) {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  document.getElementById('projectName').value = '';
  if (document.getElementById('projectStatus')) {
    document.getElementById('projectStatus').value = 'ACTIVE';
  }
  if (projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      document.getElementById('projectId').value = project.id;
      document.getElementById('projectName').value = project.name;
      if (document.getElementById('projectStatus')) {
        document.getElementById('projectStatus').value = project.status || 'ACTIVE';
      }
    }
  }
  animateModal('projectModal');
}
function closeProjectModal() { closeModal('projectModal'); }
function deleteProject(projectId) {
  if (!confirm("Are you sure you want to delete this project? All tasks under this project will also be deleted!")) return;
  fetch(`${API_URL}/projects/${projectId}`, { method: "DELETE" })
    .then(() => fetchProjects());
}
