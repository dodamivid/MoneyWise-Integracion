# Catálogos — modelo y permisos

MoneyWise expone dos tipos de catálogo con reglas distintas. Esta diferencia
es intencional; se documenta aquí para cerrar la duda planteada en el issue #68.

## 1. Catálogos por usuario

`tipos_ingreso`, `tipos_egreso`, `destinos`, `procedencias`.

- Tienen columna `usuario_id INT NULL`:
  - `usuario_id IS NULL` → entrada **global** (seed del sistema, `es_por_defecto = 1`).
  - `usuario_id = <id>` → entrada **propia** de ese usuario.
- `UNIQUE (usuario_id, nombre)`: cada usuario puede tener su propio "Mascotas"
  sin chocar con el de otro.
- Los stored procedures de escritura reciben `pUsuarioId` y aplican reglas de
  propiedad:
  - No se pueden editar ni eliminar entradas globales (`403 PERMISO_DENEGADO`).
  - No se pueden tocar entradas de otro usuario (`403 PERMISO_DENEGADO`).
- Permisos API:
  - Lectura: scope `catalogos:leer`.
  - Escritura (POST/PUT/DELETE): scope `catalogos:escribir`.

## 2. Catálogo global inmutable

`frecuencias`.

- **No** tiene `usuario_id`. Es un enum de calendario cerrado y compartido:
  `Diario`, `Semanal`, `Quincenal`, `Mensual`, `Bimestral`, `Trimestral`,
  `Semestral`, `Anual`.
- `UNIQUE (nombre)` global.
- Un usuario final **no** crea "su propia" frecuencia. Cualquier alta, cambio de
  nombre o baja (soft-delete) afecta a **todos** los usuarios y a todos los
  movimientos (`ingresos.frecuencia_id`, `egresos.frecuencia_id`).
- Por eso la escritura está reservada a administración:

  | Método | Ruta | Scope requerido |
  |---|---|---|
  | GET | `/api/v1/catalogos/frecuencias` | `catalogos:leer` |
  | POST | `/api/v1/catalogos/frecuencias` | `admin:catalogos` |
  | PUT | `/api/v1/catalogos/frecuencias/:id` | `admin:catalogos` |
  | DELETE | `/api/v1/catalogos/frecuencias/:id` | `admin:catalogos` |

- `sp_frecuencias_crear/actualizar/eliminar` no reciben `pUsuarioId` a propósito.
  `sp_frecuencias_eliminar` sí protege la integridad: devuelve
  `409 EN_USO:La frecuencia está referenciada por movimientos` si hay
  `ingresos`/`egresos` que la usan.

## ¿Y si en el futuro se quiere frecuencias por usuario?

Habría que alinear `frecuencias` con el patrón de la sección 1: agregar
`usuario_id INT NULL` + FK `ON DELETE CASCADE` + `UNIQUE (usuario_id, nombre)`,
y reescribir los tres SP (`_crear/_actualizar/_eliminar`) más el service, el
repositorio y los DTOs para pasar `usuario_id`. No está en el alcance actual.

## Nota sobre la autenticación en el entorno de integración

Hoy las rutas usan `mockAuth` (headers `x-mw-user` / `x-mw-scopes`). El scope
`admin:catalogos` se concede por defecto en desarrollo
(ver `src/middlewares/auth.middleware.ts`). Cuando se integre autenticación real
(JWT), `admin:catalogos` debe emitirse sólo a cuentas administrativas.
