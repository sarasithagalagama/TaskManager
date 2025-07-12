const API_URL = "/api";
let projects = [];
let tasks = [];
let chart;

document.addEventListener('DOMContentLoaded', () => {
  fetchProjects();
  fetchTasks();
  setupEventListeners();
});

// ====================== PROJECT MANAGEMENT ======================
function fetchProjects() {
  fetch(`${API_URL}/projects`)
    .then(res => res.json())
    .then(data => {
      projects = data;
      updateProjectUI();
    })
    .catch(error => console.error('Error fetching projects:', error));
}

function updateProjectUI() {
  populateProjectDropdown();
  populateProjectFilter();
  renderProjects();
  updateDashboard();
}

function renderProjects() {
  const section = document.getElementById('projectSection');
  if (!section) return;
  
  section.innerHTML = projects.length
    ? projects.map(project => `
      <div class="card p-6 group">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-800">${project.name}</h3>
          <span class="status-badge ${project.status === "ACTIVE" ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
            ${formatStatus(project.status)}
          </span>
        </div>
        <div class="flex gap-2 mt-6">
          <button onclick="openProjectModal(${project.id})" 
            class="btn btn-ghost hover:bg-blue-50 hover:text-blue-600">
            Edit
          </button>
          <button onclick="deleteProject(${project.id})" 
            class="btn btn-ghost hover:bg-red-50 hover:text-red-600">
            Delete
          </button>
        </div>
      </div>
    `).join('')
    : `<div class="col-span-3 text-center text-gray-500 py-8">
        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="mt-2">No projects yet</p>
        <button onclick="openProjectModal()" class="btn btn-primary mt-4 mx-auto">
          Create Project
        </button>
      </div>`;
}

function deleteProject(projectId) {
  if (!confirm("Delete this project and all its tasks?")) return;
  
  fetch(`${API_URL}/projects/${projectId}`, { method: "DELETE" })
    .then(() => {
      showNotification('Project deleted successfully');
      fetchProjects();
      fetchTasks();
    })
    .catch(error => {
      console.error('Error deleting project:', error);
      showNotification('Failed to delete project', 'error');
    });
}

// ====================== TASK MANAGEMENT ======================
function fetchTasks() {
  fetch(`${API_URL}/tasks`)
    .then(res => res.json())
    .then(data => {
      tasks = data;
      renderTasks();
      updateDashboard();
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

function renderTasks() {
  const filteredTasks = filterAndSortTasks();
  const taskList = document.getElementById('taskList');
  
  taskList.innerHTML = filteredTasks.length 
    ? filteredTasks.map(task => createTaskCard(task)).join('')
    : createEmptyState();
}

function filterAndSortTasks() {
  const projectId = document.getElementById('projectFilter').value;
  const status = document.getElementById('statusFilter').value;
  const sort = document.getElementById('sortOption').value;
  
  let filtered = [...tasks];
  
  if (projectId) {
    filtered = filtered.filter(t => t.project && t.project.id == projectId);
  }
  
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }
  
  if (sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }
  
  return filtered;
}

function createTaskCard(task) {
  return `
    <div class="card p-6 task-card">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-start gap-3">
            <input type="checkbox" ${task.status === 'COMPLETED' ? 'checked' : ''} 
              onchange="toggleTaskStatus(${task.id}, this.checked)"
              class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
            <div>
              <h3 class="text-lg font-medium text-gray-800 ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}">
                ${task.title}
              </h3>
              ${task.description ? `<p class="text-gray-600 text-sm mt-1">${task.description}</p>` : ''}
              <div class="flex flex-wrap gap-2 mt-3">
                <span class="status-badge ${statusColorClass(task.status)}">
                  ${formatStatus(task.status)}
                </span>
                ${task.dueDate ? `
                  <span class="flex items-center text-sm text-gray-500">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    ${formatDate(task.dueDate)}
                  </span>
                ` : ''}
                ${task.project ? `
                  <span class="flex items-center text-sm text-gray-500">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    ${task.project.name}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="openTaskModal(${task.id})" class="btn btn-ghost hover:bg-blue-50 hover:text-blue-600">
            Edit
          </button>
          <button onclick="deleteTask(${task.id})" class="btn btn-ghost hover:bg-red-50 hover:text-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
}

function toggleTaskStatus(taskId, isCompleted) {
  const status = isCompleted ? 'COMPLETED' : 'PENDING';
  fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  .then(() => fetchTasks())
  .catch(error => console.error('Error updating task:', error));
}

function deleteTask(taskId) {
  if (!confirm("Delete this task?")) return;
  
  fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" })
    .then(() => {
      showNotification('Task deleted successfully');
      fetchTasks();
    })
    .catch(error => {
      console.error('Error deleting task:', error);
      showNotification('Failed to delete task', 'error');
    });
}

// ====================== DASHBOARD & CHARTS ======================
function updateDashboard() {
  updateSummaryCards();
  renderChart();
}

function updateSummaryCards() {
  const summary = document.getElementById('dashboard-summary');
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === "PENDING").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter(t => t.status === "COMPLETED").length;

  summary.innerHTML = `
    <div class="stat-card hover:border-blue-200">
      <div class="stat-value text-black">${total}</div>
      <div class="stat-label text-black">Total Tasks</div>
    </div>
    <div class="stat-card hover:border-amber-200">
      <div class="stat-value text-black">${pending}</div>
      <div class="stat-label text-black">Pending</div>
    </div>
    <div class="stat-card hover:border-blue-200">
      <div class="stat-value text-black">${inProgress}</div>
      <div class="stat-label text-black">In Progress</div>
    </div>
    <div class="stat-card hover:border-green-200">
      <div class="stat-value text-black">${completed}</div>
      <div class="stat-label text-black">Completed</div>
    </div>
  `;
}

function renderChart() {
  const ctx = document.getElementById('dashboardChart')?.getContext('2d');
  if (!ctx) return;

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
          'rgba(34, 197, 94, 0.85)'
        ],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#374151',
            font: {
              family: 'Inter',
              size: 14,
              weight: '500'
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      },
      cutout: '75%',
      maintainAspectRatio: false
    }
  });
}

// ====================== UTILITY FUNCTIONS ======================
function formatStatus(status) {
  const statusMap = {
    "PENDING": "Pending",
    "IN_PROGRESS": "In Progress",
    "COMPLETED": "Completed",
    "ACTIVE": "Active",
    "ARCHIVED": "Archived"
  };
  return statusMap[status] || status;
}

function statusColorClass(status) {
  const colors = {
    "PENDING": "bg-amber-100 text-amber-800",
    "IN_PROGRESS": "bg-blue-100 text-blue-800",
    "COMPLETED": "bg-green-100 text-green-800",
    "ACTIVE": "bg-green-100 text-green-800",
    "ARCHIVED": "bg-gray-100 text-gray-600"
  };
  return colors[status] || "bg-gray-100 text-gray-600";
}

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function showNotification(message, type = 'success') {
  // Implement a notification system or use a library
  console.log(`${type}: ${message}`);
}

// ====================== MODAL FUNCTIONS ======================
function setupEventListeners() {
  // Project modal
  document.getElementById('addProjectBtn').addEventListener('click', () => openProjectModal());
  document.getElementById('closeProjectModalBtn').addEventListener('click', closeProjectModal);
  document.getElementById('cancelProjectBtn').addEventListener('click', closeProjectModal);
  document.getElementById('fabAddProject')?.addEventListener('click', () => openProjectModal());
  
  // Task modal
  document.getElementById('addTaskBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('closeModalBtn').addEventListener('click', closeTaskModal);
  document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
  document.getElementById('fabAddTask')?.addEventListener('click', () => openTaskModal());
  
  // Form submissions
  document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
  
  // Filter changes
  ['projectFilter', 'statusFilter', 'sortOption'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderTasks);
  });
}

function openProjectModal(projectId = null) {
  const form = document.getElementById('projectForm');
  form.reset();
  
  if (projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      document.getElementById('projectId').value = project.id;
      document.getElementById('projectName').value = project.name;
      document.getElementById('projectStatus').value = project.status || 'ACTIVE';
    }
  } else {
    document.getElementById('projectId').value = '';
    document.getElementById('projectStatus').value = 'ACTIVE';
  }
  
  animateModal('projectModal');
}

function openTaskModal(taskId = null) {
  const form = document.getElementById('taskForm');
  document.getElementById('modalTitle').textContent = taskId ? "Edit Task" : "Add Task";
  form.reset();
  
  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description || '';
      document.getElementById('taskStatus').value = task.status;
      document.getElementById('taskDueDate').value = task.dueDate || '';
      document.getElementById('taskProject').value = task.project?.id || '';
    }
  } else {
    document.getElementById('taskId').value = '';
    document.getElementById('taskStatus').value = 'PENDING';
  }
  
  animateModal('taskModal');
}

function handleProjectSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('projectId').value;
  const name = document.getElementById('projectName').value;
  const status = document.getElementById('projectStatus').value;
  
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;
  
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, status })
  })
  .then(res => res.json())
  .then(() => {
    showNotification(`Project ${id ? 'updated' : 'created'} successfully`);
    fetchProjects();
    closeProjectModal();
  })
  .catch(error => {
    console.error('Error saving project:', error);
    showNotification('Failed to save project', 'error');
  });
}

function handleTaskSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const status = document.getElementById('taskStatus').value;
  const dueDate = document.getElementById('taskDueDate').value;
  const projectId = document.getElementById('taskProject').value;
  
  const taskData = {
    title,
    description,
    status,
    dueDate,
    project: projectId ? { id: projectId } : null
  };
  
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/tasks/${id}` : `${API_URL}/tasks`;
  
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  })
  .then(res => res.json())
  .then(() => {
    showNotification(`Task ${id ? 'updated' : 'created'} successfully`);
    fetchTasks();
    closeTaskModal();
  })
  .catch(error => {
    console.error('Error saving task:', error);
    showNotification('Failed to save task', 'error');
  });
}

function animateModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("hidden");
  
  setTimeout(() => {
    modal.querySelector(".modal-container").classList.add("modal-active");
    const input = modal.querySelector("input:not([type=hidden]), select, textarea");
    if (input) input.focus();
  }, 10);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.querySelector(".modal-container").classList.remove("modal-active");
  
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 200);
}

function closeProjectModal() { closeModal('projectModal'); }
function closeTaskModal() { closeModal('taskModal'); }

function populateProjectDropdown() {
  const select = document.getElementById('taskProject');
  if (!select) return;
  
  select.innerHTML = `
    <option value="">No Project</option>
    ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
  `;
}

function populateProjectFilter() {
  const filter = document.getElementById('projectFilter');
  if (!filter) return;
  
  filter.innerHTML = `
    <option value="">All Projects</option>
    ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
  `;
}

function createEmptyState() {
  return `
    <div class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
      <p class="mt-1 text-gray-500">Try changing your filters or create a new task</p>
      <button onclick="openTaskModal()" class="btn btn-primary mt-6 mx-auto">
        <svg class="w-5 h-5 -ml-1 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Add Task
      </button>
    </div>
  `;
}