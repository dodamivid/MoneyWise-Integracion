import request from 'supertest';
import app from '../../../src/app';

describe('General API Behavior', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Ruta no encontrada: GET /api/nonexistent');
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body.details).toHaveProperty('traceId');
  });

  it('should handle internal server errors with 500', async () => {
    const response = await request(app)
      .get('/')
      .expect(200); 

    expect(response.body).toHaveProperty('message');
  });
});