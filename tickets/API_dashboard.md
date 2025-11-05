# [API] Dashboard / Reportes (solo lectura)
**Fecha:** 2025-10-31

## Objetivo
Entregar KPIs y reportes consolidados de ingresos, egresos y metas para alimentar las vistas del dashboard (periodos, últimas fechas de corte y comparativas).

## Supuestos y seguridad
- Endpoints sólo lectura pero requieren JWT; scopes `dashboard:leer`. `admin:dashboard` permite consultar a otros usuarios pasando `usuarioId`.
- Rangos temporales se expresan en ISO-8601 (ej. `2025-03-01T00:00:00Z`). Backend valida `desde <= hasta`.
- SPs pueden devolver múltiples result sets; el servicio mapea cada uno a secciones específicas del JSON de salida.

## Arquitectura
```
src/routes/dashboard.routes.ts
src/controllers/dashboard.controller.ts
src/services/dashboard.service.ts
src/repositories/dashboard.repository.ts
src/dtos/dashboard.dto.ts
```

## SPs requeridos
- `sp_dashboard_resumen(pUsuarioId INT, pDesde DATETIME, pHasta DATETIME)`
  - RS1: totales `{ ingresosTotal, egresosTotal, balance }`.
  - RS2: ingresos agrupados por `tipo` (`tipoId`, `nombreTipo`, `total`).
  - RS3: egresos agrupados por `tipo`.
  - RS4: ingresos agrupados por `procedencia`.
  - RS5: egresos agrupados por `destino`.
  - Todos con alias en español y fechas filtradas por el rango.
- `sp_dashboard_balance(pUsuarioId INT, pFechaCorte DATETIME)`
  - RS1: `{ ingresos, egresos, balance }`.
  - RS2 opcional: detalle de movimientos desde la última fecha de corte si se requiere auditoría.
- `sp_dashboard_metas(pUsuarioId INT, pDesde DATETIME, pHasta DATETIME)`
  - RS1: `{ metaId, nombre, montoObjetivo, ahorroReal, porcentajeAvance }`.
  - RS2: `{ totalMetasActivas, ahorroTotalPeriodo, diferenciaObjetivo }`.

## Contrato por endpoint
### GET /api/v1/dashboard/resumen
- Auth: JWT.
- Scopes: `dashboard:leer`.
- Query: `usuarioId` (opcional admins), `desde`, `hasta` (obligatorios; rango máximo recomendado 12 meses).
- Respuesta 200:
```json
{
  "ok": true,
  "data": {
    "totales": {
      "ingresos": 45000.00,
      "egresos": 32000.00,
      "balance": 13000.00
    },
    "ingresosPorTipo": [
      { "tipoId": 1, "tipo": "Salario", "total": 30000.00 }
    ],
    "egresosPorTipo": [
      { "tipoId": 4, "tipo": "Renta", "total": 12000.00 }
    ],
    "ingresosPorProcedencia": [
      { "procedenciaId": 5, "procedencia": "Empresa A", "total": 30000.00 }
    ],
    "egresosPorDestino": [
      { "destinoId": 9, "destino": "Departamento", "total": 12000.00 }
    ]
  }
}
```
- Errores: `DATOS_INVALIDOS(422)` por rangos erróneos o falta de fechas; `PERMISO_DENEGADO(403)` sin scope admin sobre terceros.
- SP: `CALL sp_dashboard_resumen(...)`.

### GET /api/v1/dashboard/balance
- Auth: JWT.
- Scopes: `dashboard:leer`.
- Query: `usuarioId` (opcional admins), `fechaCorte` (obligatoria, debe existir en tabla `fechas_corte_ahorro`; fallback a última fecha si no se envía).
- Respuesta 200:
```json
{
  "ok": true,
  "data": {
    "fechaCorte": "2025-03-31T23:59:59Z",
    "ingresosAcumulados": 45000.00,
    "egresosAcumulados": 32000.00,
    "balanceAcumulado": 13000.00
  }
}
```
- Errores: `DATOS_INVALIDOS(422)` por fecha con formato incorrecto, `NO_ENCONTRADO(404)` si no hay fecha de corte registrada, `PERMISO_DENEGADO(403)` sin scope admin.
- SP: `CALL sp_dashboard_balance(...)`.

### GET /api/v1/dashboard/metas-vs-ahorro
- Auth: JWT.
- Scopes: `dashboard:leer`.
- Query: `usuarioId` (opcional admins), `desde`, `hasta` (obligatorios).
- Respuesta 200:
```json
{
  "ok": true,
  "data": {
    "metas": [
      {
        "metaId": 7,
        "nombre": "Vacaciones 2026",
        "montoObjetivo": 150000.00,
        "ahorroReal": 35000.00,
        "porcentajeAvance": 23.33
      }
    ],
    "resumen": {
      "totalMetasActivas": 3,
      "ahorroTotalPeriodo": 12000.00,
      "diferenciaObjetivo": -28000.00
    }
  }
}
```
- Errores: `DATOS_INVALIDOS(422)` por rangos, `PERMISO_DENEGADO(403)` sin permisos.
- SP: `CALL sp_dashboard_metas(...)`.

## Criterios de aceptación
- DTOs validan fechas obligatorias y formatos; se limitan rangos máximos si el SP lo requiere.
- Servicio transforma múltiples result sets en JSON consolidado sin exponer arrays vacíos como `null`.
- Swagger/Postman incluye escenarios: rango válido, sin datos, fecha de corte inexistente, acceso sin permisos.

## Riesgos
- SPs que devuelven múltiples result sets deben estar sincronizados con el orden esperado; cualquier cambio rompe el mapeo.
- Rendimiento: agregar índices en tablas grandes (ver ticket de BD) y cache opcional para consultas repetitivas.

## Pruebas sugeridas
- Verificar totales con data conocida, consulta cruzada con metas y balance, error por fecha fuera del formato y acceso a datos de otro usuario sin scope admin.
