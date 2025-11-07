import request from 'supertest';
import app from '../../../src/app';

describe('Dashboard API', () => {
  const headers = { 'x-mw-scopes': 'dashboard:leer' };

  it('GET /api/v1/dashboard/resumen debe validar fechas y responder 422 si faltan', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/resumen')
      .set(headers)
      .expect(422);

    expect(res.body).toHaveProperty('status', 'error');
  });

  it('GET /api/v1/dashboard/resumen con rango válido responde 200 con ok=true', async () => {
    const desde = '2025-01-01T00:00:00Z';
    const hasta = '2025-02-01T00:00:00Z';

    const res = await request(app)
      .get('/api/v1/dashboard/resumen')
      .query({ desde, hasta })
      .set(headers)
      .expect(200);

    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('totales');
  });

  it('GET /api/v1/dashboard/balance responde 200 con ok=true', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/balance')
      .query({ fechaCorte: '2025-03-31T23:59:59Z' })
      .set(headers)
      .expect(200);

    expect(res.body).toHaveProperty('ok', true);
    expect(res.body.data).toHaveProperty('fechaCorte');
  });

  it('GET /api/v1/dashboard/metas-vs-ahorro sin scope retorna 403', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/metas-vs-ahorro')
      .query({ desde: '2025-01-01T00:00:00Z', hasta: '2025-02-01T00:00:00Z' })
      // sin x-mw-scopes
      .expect(403);

    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('statusCode', 403);
  });
});
