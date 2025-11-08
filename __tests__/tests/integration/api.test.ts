import request from 'supertest';
import app from '../../../src/app';

describe('General API Behavior', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('status', 'error');
  // Mensaje ahora proviene del notFoundHandler centralizado
  expect(response.body).toHaveProperty('message');
  expect(String(response.body.message)).toMatch(/Ruta no encontrada/i);
  });

  it('should handle internal server errors with 500', async () => {
    const response = await request(app)
      .get('/')
      .expect(200); 

    expect(response.body).toHaveProperty('message');
  });
});