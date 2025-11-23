// backend/server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs'); 
const path = require('path'); 
const app = express();
const PORT = 3000;


const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');


app.use(cors()); 
app.use(express.json());

// --- Funções de Persistência de Dados (Leitura/Escrita) ---

function readTasks() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT' || data === '') {
            return [];
        }
        console.error("Erro ao ler arquivo:", error);
        return [];
    }
}

function writeTasks(tasks) {
    try {
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error("Erro ao escrever arquivo:", error);
    }
}


let taskIdCounter = readTasks().reduce((max, task) => Math.max(max, task.id), 0) + 1;


// --- Rotas da API (CRUD) ---

app.get('/api/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks.sort((a, b) => b.id - a.id));
});

app.post('/api/tasks', (req, res) => {
    const { atividade, frequencia, prioridade, prazo } = req.body;
    const tasks = readTasks();

    if (!atividade) {
        return res.status(400).json({ message: 'A atividade é obrigatória.' });
    }

    const newTask = {
        id: taskIdCounter++,
        atividade,
        frequencia: frequencia || 'Única',
        prioridade: prioridade || 'Moderada',
        prazo: prazo || null,
        concluida: false
    };

    tasks.push(newTask);
    writeTasks(tasks); 
    res.status(201).json(newTask); 
});

app.patch('/api/tasks/:id/toggle', (req, res) => {
    const taskId = parseInt(req.params.id);
    let tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    tasks[taskIndex].concluida = !tasks[taskIndex].concluida;
    
    writeTasks(tasks); 
    res.json(tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    let tasks = readTasks();
    const initialLength = tasks.length;
    
    tasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === initialLength) {
        return res.status(404).json({ message: 'Tarefa não encontrada para deleção.' });
    }

    writeTasks(tasks); 
    res.status(204).send(); 
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
