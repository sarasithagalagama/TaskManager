const API_URL = "/api";
let projects = [];
let tasks = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchProjects();
  fetchTasks();
  setupModal();
  setupProjectModal();
});

function fetchProjects() {
  fetch(`${API_URL}/projects`)
    .then(res => res.json())
    .then(data => {
      projects = data;
      populateProjectDropdown();
      populateProjectFilter();
      displayProjectList(); // show the list of projects
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

// ------------- PROJECT MANAGEMENT --------------

function displayProjectList() {
  const list = document.getElementById('projectList');
  if (!list) return;
  list.innerHTML = projects.map(project => `
    <div class="bg-gray-800 p-3 rounded flex items-center justify-between gap-4">
      <div>
        <span class="font-semibold">${project.name}</span>
        <span class="ml-2 text-xs text-gray-400">[${project.status || "ACTIVE"}]</span>
      </div>
      <div class="flex gap-2">
        <button onclick="openProjectModal(${project.id})" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">Edit</button>
        <button onclick="deleteProject(${project.id})" class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Delete</button>
      </div>
    </div>
  `).join('');
}

function setupProjectModal() {
  document.getElementById('addProjectBtn').onclick = () => openProjectModal();
  document.getElementById('closeProjectModalBtn').onclick = () => closeProjectModal();
  document.getElementById('cancelProjectBtn').onclick = () => closeProjectModal();

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
  // If your form has the status dropdown:
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
  document.getElementById('projectModal').classList.remove('hidden');
}

function closeProjectModal() {
  document.getElementById('projectModal').classList.add('hidden');
}

function deleteProject(projectId) {
  if (!confirm("Are you sure you want to delete this project? All tasks under this project will also be deleted!")) return;
  fetch(`${API_URL}/projects/${projectId}`, { method: "DELETE" })
    .then(() => fetchProjects());
}

// ------------- TASK MANAGEMENT --------------

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
    <div class="bg-gray-800 p-4 rounded shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold">${task.title}</h2>
        <p class="text-gray-400 text-sm mb-1">${task.description || ""}</p>
        <div class="text-xs text-gray-400 flex gap-4">
          <span>Status: <span class="font-semibold">${formatStatus(task.status)}</span></span>
          <span>Due: ${task.dueDate || '-'}</span>
          <span>Project: ${task.project ? task.project.name : '-'}</span>
        </div>
      </div>
      <div class="flex gap-2">
        <button onclick="openTaskModal(${task.id})" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">Edit</button>
        <button onclick="deleteTask(${task.id})" class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Delete</button>
      </div>
    </div>
  `).join('') : `<div class="text-gray-400">No tasks found.</div>`;
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
  const modal = document.getElementById('taskModal');
  const openBtn = document.getElementById('addTaskBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  openBtn.onclick = () => openTaskModal();
  closeBtn.onclick = cancelBtn.onclick = () => closeTaskModal();
}

function openTaskModal(taskId) {
  const modal = document.getElementById('taskModal');
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
  modal.classList.remove('hidden');
  form.onsubmit = submitTaskForm;
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.add('hidden');
}

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
    <div class="bg-gray-800 px-4 py-2 rounded text-center">
      <div class="text-2xl font-bold">${total}</div>
      <div class="text-xs text-gray-400">Total Tasks</div>
    </div>
    <div class="bg-yellow-800 px-4 py-2 rounded text-center">
      <div class="text-2xl font-bold">${pending}</div>
      <div class="text-xs text-yellow-200">Pending</div>
    </div>
    <div class="bg-blue-800 px-4 py-2 rounded text-center">
      <div class="text-2xl font-bold">${inProgress}</div>
      <div class="text-xs text-blue-200">In Progress</div>
    </div>
    <div class="bg-green-800 px-4 py-2 rounded text-center">
      <div class="text-2xl font-bold">${completed}</div>
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
        data: [pending, inProgress, completed]
      }]
    },
    options: {
      plugins: { legend: { labels: { color: "white" } } },
      cutout: "70%"
    }
  });
}
