import request from 'supertest';
import app from '../../../src/app';

describe('Health Check API', () => {
  describe('GET /health', () => {
    it('should return health status with 200', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /', () => {
    it('should return MoneyWise API message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({ message: "MoneyWise API" });
    });
  });
});