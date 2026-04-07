// netlify/functions/tasks.js
// This replaces the entire Express backend
// Netlify runs this as a serverless function on every API request
//
// Route mapping:
//   GET    /.netlify/functions/tasks         → get all tasks
//   POST   /.netlify/functions/tasks         → create task
//   PATCH  /.netlify/functions/tasks?id=X    → toggle complete
//   DELETE /.netlify/functions/tasks?id=X    → delete task
//
// NOTE: Netlify Functions are stateless — each call is independent.
// We use a simple in-memory store here for demo purposes.
// In production you would replace `tasks` with a database call.

let tasks = [];
let nextId = 1;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const method = event.httpMethod;
  const id = event.queryStringParameters?.id
    ? parseInt(event.queryStringParameters.id)
    : null;

  // ── GET all tasks ───────────────────────────────────────
  if (method === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, tasks })
    };
  }

  // ── POST create task ────────────────────────────────────
  if (method === 'POST') {
    let body;
    try { body = JSON.parse(event.body); } catch { body = {}; }

    const { title } = body;
    if (!title || title.trim() === '') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Title is required' })
      };
    }

    const task = {
      id: nextId++,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(task);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true, task })
    };
  }

  // ── PATCH toggle complete ───────────────────────────────
  if (method === 'PATCH') {
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'ID is required' })
      };
    }
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'Task not found' })
      };
    }
    task.completed = !task.completed;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, task })
    };
  }

  // ── DELETE task ─────────────────────────────────────────
  if (method === 'DELETE') {
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'ID is required' })
      };
    }
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, message: 'Task not found' })
      };
    }
    tasks.splice(index, 1);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Task deleted' })
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ success: false, message: 'Method not allowed' })
  };
};
