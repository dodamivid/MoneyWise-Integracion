import request from 'supertest';
import app from '../../src/app';

function authHeaders(usuarioId: number, scopes: string[] = []) {
  return {
    'X-Usuario-Id': String(usuarioId),
    'X-Scopes': scopes.join(' '),
  };
}

describe('API Fechas de Corte', () => {
  let baseFecha = new Date('2025-03-31T23:59:59Z');

  it('crea una fecha de corte', async () => {
    const res = await request(app)
      .post('/api/v1/ahorro/fechas-corte')
      .set(authHeaders(10, ['ahorro:escribir']))
      .send({ fechaCorte: baseFecha.toISOString() });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.fechaCorteId).toBeDefined();
  });

  it('lista fechas de corte paginadas', async () => {
    // Crear otra fecha posterior
    const segunda = new Date('2025-04-30T23:59:59Z');
    await request(app)
      .post('/api/v1/ahorro/fechas-corte')
      .set(authHeaders(10, ['ahorro:escribir']))
      .send({ fechaCorte: segunda.toISOString() });

    const res = await request(app)
      .get('/api/v1/ahorro/fechas-corte?pagina=1&tamanoPagina=10')
      .set(authHeaders(10, ['ahorro:leer']))
      .send();

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.paginacion.total).toBeGreaterThanOrEqual(2);
  });

  it('rechaza duplicado', async () => {
    const res = await request(app)
      .post('/api/v1/ahorro/fechas-corte')
      .set(authHeaders(10, ['ahorro:escribir']))
      .send({ fechaCorte: baseFecha.toISOString() });

    // Debe ser conflicto 409 según contrato
    expect(res.status).toBe(409);
    expect(res.body.status).toBe('error');
  });

  it('422 por orden inválido', async () => {
    const res = await request(app)
      .get('/api/v1/ahorro/fechas-corte?orden=invalidCampo')
      .set(authHeaders(10, ['ahorro:leer']))
      .send();
    expect(res.status).toBe(422);
    expect(res.body.status).toBe('error');
  });

  it('422 por tamanoPagina > 100', async () => {
    const res = await request(app)
      .get('/api/v1/ahorro/fechas-corte?tamanoPagina=101')
      .set(authHeaders(10, ['ahorro:leer']))
      .send();
    expect(res.status).toBe(422);
    expect(res.body.status).toBe('error');
  });

  it('deniega listar de otro usuario sin admin', async () => {
    const res = await request(app)
      .get('/api/v1/ahorro/fechas-corte?usuarioId=11&pagina=1&tamanoPagina=5')
      .set(authHeaders(10, ['ahorro:leer']))
      .send();

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('status', 'error');
  });

  it('permite listar de otro usuario con admin', async () => {
    const res = await request(app)
      .get('/api/v1/ahorro/fechas-corte?usuarioId=11&pagina=1&tamanoPagina=5')
      .set(authHeaders(10, ['ahorro:leer', 'admin:ahorro']))
      .send();

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('deniega eliminar de otro usuario sin admin', async () => {
    // obtener una fecha existente del usuario 10
    const list = await request(app)
      .get('/api/v1/ahorro/fechas-corte?pagina=1&tamanoPagina=10')
      .set(authHeaders(10, ['ahorro:leer']))
      .send();
    const id = list.body.data[0].fechaCorteId;

    const del = await request(app)
      .delete(`/api/v1/ahorro/fechas-corte/${id}`)
      .set(authHeaders(11, ['ahorro:escribir']))
      .send();

    expect(del.status).toBe(403);
    expect(del.body).toHaveProperty('status', 'error');
  });

  it('elimina una fecha de corte', async () => {
    // Crear nueva para eliminar
    const eliminarFecha = new Date('2025-05-31T23:59:59Z');
    const crea = await request(app)
      .post('/api/v1/ahorro/fechas-corte')
      .set(authHeaders(10, ['ahorro:escribir']))
      .send({ fechaCorte: eliminarFecha.toISOString() });

    const id = crea.body.data.fechaCorteId;
    const del = await request(app)
      .delete(`/api/v1/ahorro/fechas-corte/${id}`)
      .set(authHeaders(10, ['ahorro:escribir']))
      .send();

    expect(del.status).toBe(200);
    expect(del.body.ok).toBe(true);
    expect(del.body.data.eliminado).toBe(true);
  });
});
