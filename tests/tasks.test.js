// tests/tasks.test.js
// Tests the Netlify Function handler directly (no HTTP server needed)

const { handler } = require('../netlify/functions/tasks');

// Helper to build a mock Netlify event
function makeEvent(method, body = null, id = null) {
  return {
    httpMethod: method,
    body: body ? JSON.stringify(body) : null,
    queryStringParameters: id ? { id: String(id) } : {}
  };
}

// Reset in-memory state between tests by re-requiring the module
// (Jest module cache trick)
beforeEach(() => {
  jest.resetModules();
});

// Re-require fresh handler for each test suite
let fn;
beforeEach(() => {
  fn = require('../netlify/functions/tasks').handler;
});

// ── GET ──────────────────────────────────────────────────
describe('GET tasks', () => {
  test('returns empty array initially', async () => {
    const res = await fn(makeEvent('GET'));
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.tasks)).toBe(true);
  });
});

// ── POST ─────────────────────────────────────────────────
describe('POST tasks', () => {
  test('creates a task with valid title', async () => {
    const res = await fn(makeEvent('POST', { title: 'Complete Docker Lab' }));
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.task.title).toBe('Complete Docker Lab');
    expect(body.task.completed).toBe(false);
  });

  test('returns 400 if title is missing', async () => {
    const res = await fn(makeEvent('POST', {}));
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 if title is empty string', async () => {
    const res = await fn(makeEvent('POST', { title: '   ' }));
    expect(res.statusCode).toBe(400);
  });
});

// ── PATCH ────────────────────────────────────────────────
describe('PATCH tasks', () => {
  test('returns 400 if no id provided', async () => {
    const res = await fn(makeEvent('PATCH'));
    expect(res.statusCode).toBe(400);
  });

  test('returns 404 for non-existent task', async () => {
    const res = await fn(makeEvent('PATCH', null, 999));
    expect(res.statusCode).toBe(404);
  });
});

// ── DELETE ───────────────────────────────────────────────
describe('DELETE tasks', () => {
  test('returns 400 if no id provided', async () => {
    const res = await fn(makeEvent('DELETE'));
    expect(res.statusCode).toBe(400);
  });

  test('returns 404 for non-existent task', async () => {
    const res = await fn(makeEvent('DELETE', null, 999));
    expect(res.statusCode).toBe(404);
  });
});

// ── OPTIONS (CORS) ───────────────────────────────────────
describe('OPTIONS preflight', () => {
  test('returns 200 for CORS preflight', async () => {
    const res = await fn(makeEvent('OPTIONS'));
    expect(res.statusCode).toBe(200);
  });
});

// ── Invalid method ───────────────────────────────────────
describe('Invalid method', () => {
  test('returns 405 for unsupported method', async () => {
    const res = await fn(makeEvent('PUT'));
    expect(res.statusCode).toBe(405);
  });
});
