

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;


app.use(cors()); 
app.use(express.json());

// --- Simulação de Banco de Dados ---
let tasks = []; 
let taskIdCounter = 1; 




app.get('/api/tasks', (req, res) => {
    res.json(tasks.sort((a, b) => b.id - a.id));
});


app.post('/api/tasks', (req, res) => {
    const { atividade, frequencia, prioridade, prazo } = req.body;

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
    res.status(201).json(newTask); 
});


app.patch('/api/tasks/:id/toggle', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    task.concluida = !task.concluida;
    res.json(task);
});


app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const initialLength = tasks.length;

    tasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === initialLength) {
        return res.status(404).json({ message: 'Tarefa não encontrada para deleção.' });
    }

    res.status(204).send(); 
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});