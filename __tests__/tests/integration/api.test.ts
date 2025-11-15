import request from 'supertest';
import type { Test } from 'supertest';
import app from '../../../src/app';

const withApiKey = (req: Test) =>
  req.set('x-api-key', process.env.TEST_API_KEY ?? 'test-x-api-key');

describe('General API Behavior', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await withApiKey(
      request(app).get('/api/nonexistent')
    ).expect(404);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Route not found: GET /api/nonexistent');
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty('traceId');
  });

  it('should reject calls without x-api-key header', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(401);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Missing x-api-key header');
    expect(response.body).toHaveProperty('statusCode', 401);
    expect(response.body).toHaveProperty('traceId');
  });

  it('should handle internal server errors with 500', async () => {
    const response = await withApiKey(
      request(app).get('/api/v1/test/boom')
    ).expect(500);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('statusCode', 500);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('traceId');
  });
});
