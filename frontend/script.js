
const API_URL = 'http://localhost:3000/api/tasks';


const newTaskForm = document.getElementById('newTaskForm');
const tasksList = document.getElementById('tasks-list');
const tabButtons = document.querySelectorAll('.tab-button');
const totalCountEl = document.getElementById('total-count');
const activeCountEl = document.getElementById('active-count');
const completedCountEl = document.getElementById('completed-count');
const emptyState = document.getElementById('empty-state');

let currentFilter = 'all';


async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        return [];
    }
}

async function createTask(taskData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (response.ok) {
            await loadTasks(); 
        }
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
    }
}

async function toggleTaskStatus(taskId) {
    try {
        await fetch(`${API_URL}/${taskId}/toggle`, { method: 'PATCH' });
        await loadTasks(); 
    } catch (error) {
        console.error("Erro ao alternar status:", error);
    }
}

async function deleteTask(taskId) {
    try {
        await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
        await loadTasks(); 
    } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
    }
}


function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item priority-${task.prioridade} ${task.concluida ? 'completed' : ''}`;
    
    const formattedPrazo = task.prazo 
        ? new Date(task.prazo + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'Sem prazo';
    
    taskItem.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.concluida ? 'checked' : ''} data-id="${task.id}">
        <div class="task-content">
            <h4>${task.atividade}</h4>
            <div class="task-meta">
                <span>Frequência: ${task.frequencia}</span>
                | <span>Prioridade: ${task.prioridade}</span>
                ${task.prazo ? `| <span>Prazo: ${formattedPrazo}</span>` : ''}
            </div>
        </div>
        <div class="task-actions">
            <button class="task-delete-btn" data-id="${task.id}" title="Deletar">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;

    taskItem.querySelector('.task-checkbox').addEventListener('change', (e) => toggleTaskStatus(e.target.dataset.id));
    taskItem.querySelector('.task-delete-btn').addEventListener('click', (e) => deleteTask(e.currentTarget.dataset.id));
    
    return taskItem;
}

function renderTasks(tasks) {
    tasksList.innerHTML = '';
    
    const activeTasks = tasks.filter(t => !t.concluida);
    const completedTasks = tasks.filter(t => t.concluida);
    
    totalCountEl.textContent = tasks.length;
    activeCountEl.textContent = activeTasks.length;
    completedCountEl.textContent = completedTasks.length;

    let filteredTasks;
    
    if (currentFilter === 'active') {
        filteredTasks = activeTasks;
    } else if (currentFilter === 'completed') {
        filteredTasks = completedTasks;
    } else { 
        filteredTasks = tasks;
    }

    
    if (filteredTasks.length === 0 && tasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `<div class="empty-state">
                <p>Nenhuma tarefa ${currentFilter === 'active' ? 'ativa' : 'concluída'}.</p>
                <small>Tente mudar o filtro.</small>
            </div>`;
            return;
        }

        filteredTasks.forEach(task => tasksList.appendChild(createTaskElement(task)));
    }
}

async function loadTasks() {
    const tasks = await fetchTasks();
    renderTasks(tasks);
}



newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const activity = document.getElementById('atividade').value.trim();
    if (!activity) return;

    const taskData = {
        atividade: activity,
        frequencia: document.getElementById('frequencia').value,
        prioridade: document.getElementById('prioridade').value,
        prazo: document.getElementById('prazo').value || null 
    };
    
    createTask(taskData);
    newTaskForm.reset();
});

tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        loadTasks(); 
    });
});


document.addEventListener('DOMContentLoaded', loadTasks);