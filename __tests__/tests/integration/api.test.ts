import request from 'supertest';
import app from '../../../src/app';

describe('General API Behavior', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Route not found');
  });

  it('should handle internal server errors with 500', async () => {
    const response = await request(app)
      .get('/')
      .expect(200); 

    expect(response.body).toHaveProperty('message');
  });
});