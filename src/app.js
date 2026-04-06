const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory task store (no DB needed for demo)
let tasks = [];
let nextId = 1;

// GET all tasks
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, tasks });
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  const task = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json({ success: true, task });
});

// PATCH toggle complete
app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  task.completed = !task.completed;
  res.json({ success: true, task });
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.json({ success: true, message: 'Task deleted' });
});

// Reset tasks (used in tests)
app.post('/api/tasks/reset', (req, res) => {
  tasks = [];
  nextId = 1;
  res.json({ success: true });
});

module.exports = app;
