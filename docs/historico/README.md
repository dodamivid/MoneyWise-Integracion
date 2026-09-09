# Histórico — esquemas legados

> **NO USAR.** Los archivos de esta carpeta son volcados antiguos que se
> conservan solo como referencia histórica. La **única fuente de verdad** del
> esquema es [`db/moneywise_schema.sql`](../../db/moneywise_schema.sql), que es
> el que consumen `scripts/import-db.js`, los stored procedures y la API.

## Archivos

### `Dump20251015 (1).sql`

Volcado obsoleto (MySQL Workbench, 2025-10-15). **Incompatible** con la API y
los stored procedures actuales. No lo importes.

Diferencias frente al esquema canónico:

| | `db/moneywise_schema.sql` (canónico) | `Dump20251015 (1).sql` (legado) |
|---|---|---|
| Nombres de tabla | plural (`usuarios`, `ingresos`, `egresos`) | singular (`usuario`, `ingreso`, `egreso`) |
| Typos | — | `prosedencia` |
| Tablas extra | — | `recompensas` |
| Columnas | `monto DECIMAL(12,2)`, `eliminado_en` (soft-delete), FKs completas | `cantidad float/int`, sin soft-delete, FKs parciales |
| Collation | `utf8mb4_unicode_ci` | `utf8mb4_0900_ai_ci` |
| Datos | sin filas | sin filas |

## Tabla `recompensas` — fuera de alcance

La tabla `recompensas` solo existe en este dump legado. **No forma parte del
alcance del producto**: no está en `db/moneywise_schema.sql`, no la usa ningún
endpoint ni stored procedure, y no hay modelo/repositorio para ella en `src/`.
Si en el futuro se decide incorporar un módulo de recompensas, deberá diseñarse
sobre el esquema canónico (nombres en plural, `id INT AUTO_INCREMENT`,
soft-delete, etc.), no copiarse de aquí.
