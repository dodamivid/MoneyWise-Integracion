import request from 'supertest';
import app from '../../../src/app';

describe('General API Behavior', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Route not found: GET /api/nonexistent');
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty('traceId');
  });

  // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
  // TEST QUE VERIFICA EL MANEJO CENTRALIZADO DE ERRORES (500)
  // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
  it('should return 500 with formatted error and traceId', async () => {
    const response = await request(app)
      .get('/api/v1/test/boom')   // ✔ ESTA ES LA RUTA CORRECTA
      .expect(500);               // ✔ AHORA SÍ ESPERA 500

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('statusCode', 500);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('traceId');
  });
});
