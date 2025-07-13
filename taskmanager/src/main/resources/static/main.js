const API_URL = '/api/tasks';

const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks-list');
const taskProjectSelect = document.getElementById('task-project');

// Remove showProjectForTasks and toggleProjectBtn logic

async function fetchTasks() {
  tasksList.innerHTML = '<div class="text-gray-400">Loading...</div>';
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    if (tasks.length === 0) {
      tasksList.innerHTML = '<div class="text-gray-500 text-center">No tasks yet. Add your first task above!</div>';
      return;
    }
    tasksList.innerHTML = '';
    tasks.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.className = `p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between bg-gray-800 border border-gray-700 shadow mb-4 gap-4`;
      taskDiv.innerHTML = `
        <div>
          <div class="flex items-center gap-4 mb-2">
            <span class="text-lg font-semibold">${task.title}</span>
            <span class="badge bg-${task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'warning' : 'secondary'} text-xs">${task.status}</span>
            ${task.project && task.project.name ? `<span class='badge bg-info text-xs'>${task.project.name}</span>` : ''}
          </div>
          ${task.description ? `<div class='text-gray-400 italic mb-1'>${task.description}</div>` : ''}
          ${task.dueDate ? `<div class='text-sm text-orange-400 mb-1'>Due: ${task.dueDate}</div>` : ''}
        </div>
        <div class="flex gap-4 mt-2 md:mt-0">
          <button class="btn btn-sm btn-outline-info px-4" onclick="editTask(${task.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger px-4" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      `;
      tasksList.appendChild(taskDiv);
    });
  } catch (err) {
    tasksList.innerHTML = '<div class="text-red-400">Failed to load tasks.</div>';
  }
}

window.updateStatus = async function(id, currentStatus) {
  let newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchTasks();
  } catch {}
}

window.deleteTask = async function(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) fetchTasks();
  } catch {}
}

window.updateTaskStatus = async function(id, newStatus) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchTasks();
  } catch {}
}

taskForm.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const dueDate = document.getElementById('dueDate').value;
  const projectId = taskProjectSelect.value;
  if (!title) return;
  if (!projectId) return;
  try {
    // Fetch the project object by ID
    const projectRes = await fetch(`/api/projects/${projectId}`);
    const project = await projectRes.json();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, dueDate, status: 'PENDING', project })
    });
    if (res.ok) {
      taskForm.reset();
      fetchTasks();
    }
  } catch {}
};

fetchTasks();

// --- Projects CRUD ---
const PROJECT_API = '/api/projects';
const projectForm = document.getElementById('project-form');
const projectsList = document.getElementById('projects-list');
const projectEditForm = document.getElementById('project-edit-form');
const cancelProjectEditBtn = document.getElementById('cancel-project-edit-btn');
let editingProjectId = null;

async function fetchProjects() {
  projectsList.innerHTML = '<div class="text-gray-400">Loading...</div>';
  try {
    const res = await fetch(PROJECT_API);
    const projects = await res.json();
    if (projects.length === 0) {
      projectsList.innerHTML = '<div class="text-gray-500 text-center">No projects yet. Add your first project above!</div>';
      return;
    }
    projectsList.innerHTML = '';
    projects.forEach(project => {
      const div = document.createElement('div');
      div.className = 'p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between bg-gray-800 border border-gray-700 shadow';
      div.innerHTML = `
        <div>
          <span class="text-lg font-semibold">${project.name}</span>
          <span class="badge bg-${project.status === 'ACTIVE' ? 'success' : 'secondary'} text-xs ml-2">${project.status}</span>
        </div>
        <div class="flex gap-2 mt-2 md:mt-0">
          <button class="btn btn-sm btn-outline-info" onclick="editProject(${project.id}, '${project.name.replace(/'/g, "&#39;")}', '${project.status}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProject(${project.id})">Delete</button>
        </div>
      `;
      projectsList.appendChild(div);
    });
  } catch (err) {
    projectsList.innerHTML = '<div class="text-red-400">Failed to load projects.</div>';
  }
}

projectForm.onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('project-name').value.trim();
  const status = document.getElementById('project-status').value;
  if (!name) return;
  try {
    const res = await fetch(PROJECT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status })
    });
    if (res.ok) {
      projectForm.reset();
      fetchProjects();
    }
  } catch {}
};

window.editProject = function(id, name, status) {
  editingProjectId = id;
  projectEditForm.classList.remove('hidden');
  document.getElementById('edit-project-name').value = name;
  document.getElementById('edit-project-status').value = status;
};

cancelProjectEditBtn.onclick = () => {
  projectEditForm.classList.add('hidden');
  editingProjectId = null;
};

projectEditForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!editingProjectId) return;
  const name = document.getElementById('edit-project-name').value.trim();
  const status = document.getElementById('edit-project-status').value;
  if (!name) return;
  try {
    const res = await fetch(`${PROJECT_API}/${editingProjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status })
    });
    if (res.ok) {
      projectEditForm.classList.add('hidden');
      editingProjectId = null;
      fetchProjects();
    }
  } catch {}
};

window.deleteProject = async function(id) {
  if (!confirm('Delete this project?')) return;
  try {
    const res = await fetch(`${PROJECT_API}/${id}`, { method: 'DELETE' });
    if (res.ok) fetchProjects();
  } catch {}
};

fetchProjects();

async function populateTaskProjectDropdown() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    taskProjectSelect.innerHTML = '<option value="">Select Project</option>';
    projects.forEach(project => {
      const opt = document.createElement('option');
      opt.value = project.id;
      opt.textContent = project.name;
      taskProjectSelect.appendChild(opt);
    });
  } catch {}
}

// Call on load
populateTaskProjectDropdown();

// --- Task Edit Modal Logic ---
let editingTaskId = null;
const taskEditModal = document.getElementById('task-edit-modal');
const taskEditForm = document.getElementById('task-edit-form');
const closeTaskEditModalBtn = document.getElementById('close-task-edit-modal');
const cancelTaskEditBtn = document.getElementById('cancel-task-edit-btn');
const editTaskTitle = document.getElementById('edit-task-title');
const editTaskDescription = document.getElementById('edit-task-description');
const editTaskDueDate = document.getElementById('edit-task-dueDate');
const editTaskStatus = document.getElementById('edit-task-status');
const editTaskProject = document.getElementById('edit-task-project');

function openTaskEditModal(task) {
  editingTaskId = task.id;
  editTaskTitle.value = task.title;
  editTaskDescription.value = task.description || '';
  editTaskDueDate.value = task.dueDate || '';
  editTaskStatus.value = task.status;
  // Populate project dropdown and set selected
  populateEditTaskProjectDropdown(task.project ? task.project.id : null).then(() => {
    editTaskProject.value = task.project ? task.project.id : '';
  });
  taskEditModal.classList.remove('hidden');
}
function closeTaskEditModal() {
  editingTaskId = null;
  taskEditModal.classList.add('hidden');
}
if (closeTaskEditModalBtn) closeTaskEditModalBtn.onclick = closeTaskEditModal;
if (cancelTaskEditBtn) cancelTaskEditBtn.onclick = closeTaskEditModal;
taskEditForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!editingTaskId) return;
  const title = editTaskTitle.value.trim();
  const description = editTaskDescription.value.trim();
  const dueDate = editTaskDueDate.value;
  const status = editTaskStatus.value;
  const projectId = editTaskProject.value;
  if (!title || !projectId) return;
  // Fetch the project object by ID
  const projectRes = await fetch(`/api/projects/${projectId}`);
  const project = await projectRes.json();
  try {
    const res = await fetch(`${API_URL}/${editingTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, dueDate, status, project })
    });
    if (res.ok) {
      closeTaskEditModal();
      fetchTasks();
    }
  } catch {}
};
async function populateEditTaskProjectDropdown(selectedId) {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    editTaskProject.innerHTML = '<option value="">Select Project</option>';
    projects.forEach(project => {
      const opt = document.createElement('option');
      opt.value = project.id;
      opt.textContent = project.name;
      if (selectedId && project.id == selectedId) opt.selected = true;
      editTaskProject.appendChild(opt);
    });
  } catch {}
}
// --- End Task Edit Modal Logic ---

window.editTask = async function(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) return;
    const task = await res.json();
    openTaskEditModal(task);
  } catch {}
} 