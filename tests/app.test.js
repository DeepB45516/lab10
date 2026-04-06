const request = require('supertest');
const app = require('../src/app');

// Reset tasks before each test
beforeEach(async () => {
  await request(app).post('/api/tasks/reset');
});

// ── GET /api/tasks ──────────────────────────────────────
describe('GET /api/tasks', () => {
  test('should return empty array initially', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tasks).toEqual([]);
  });

  test('should return all tasks after creation', async () => {
    await request(app).post('/api/tasks').send({ title: 'Study CI/CD' });
    await request(app).post('/api/tasks').send({ title: 'Submit Lab Report' });
    const res = await request(app).get('/api/tasks');
    expect(res.body.tasks.length).toBe(2);
  });
});

// ── POST /api/tasks ─────────────────────────────────────
describe('POST /api/tasks', () => {
  test('should create a task with valid title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Complete Docker Lab' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.task.title).toBe('Complete Docker Lab');
    expect(res.body.task.completed).toBe(false);
  });

  test('should return 400 if title is missing', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('should return 400 if title is empty string', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── PATCH /api/tasks/:id ────────────────────────────────
describe('PATCH /api/tasks/:id', () => {
  test('should toggle task to completed', async () => {
    const create = await request(app).post('/api/tasks').send({ title: 'Push to GitHub' });
    const id = create.body.task.id;
    const res = await request(app).patch(`/api/tasks/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.task.completed).toBe(true);
  });

  test('should toggle task back to incomplete', async () => {
    const create = await request(app).post('/api/tasks').send({ title: 'Deploy to Netlify' });
    const id = create.body.task.id;
    await request(app).patch(`/api/tasks/${id}`);
    const res = await request(app).patch(`/api/tasks/${id}`);
    expect(res.body.task.completed).toBe(false);
  });

  test('should return 404 for non-existent task', async () => {
    const res = await request(app).patch('/api/tasks/999');
    expect(res.statusCode).toBe(404);
  });
});

// ── DELETE /api/tasks/:id ───────────────────────────────
describe('DELETE /api/tasks/:id', () => {
  test('should delete an existing task', async () => {
    const create = await request(app).post('/api/tasks').send({ title: 'Run SonarQube' });
    const id = create.body.task.id;
    const res = await request(app).delete(`/api/tasks/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('should return 404 when deleting non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/999');
    expect(res.statusCode).toBe(404);
  });

  test('task should not exist after deletion', async () => {
    const create = await request(app).post('/api/tasks').send({ title: 'Temp Task' });
    const id = create.body.task.id;
    await request(app).delete(`/api/tasks/${id}`);
    const res = await request(app).get('/api/tasks');
    const found = res.body.tasks.find(t => t.id === id);
    expect(found).toBeUndefined();
  });
});
