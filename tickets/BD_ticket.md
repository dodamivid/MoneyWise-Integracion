# [BD] Normalización, catálogos y SPs para MoneyWise API v1
**Fecha:** 2025-10-31

## Objetivo
Reestructurar la base de datos MySQL usando un modelo normalizado, crear catálogos requeridos por los módulos del dashboard y entregar los procedimientos almacenados consumidos por la capa de integración (API Node.js). Todo SP debe exponer alias en español, soporte de paginación y manejar errores con `SIGNAL`.

## Alcance
1. Normalizar el esquema actual (`Dump20251015 (1).sql`) corrigiendo nombres, llaves y tipos.
2. Crear tablas y catálogos faltantes (frecuencias, procedencias, fechas de corte, tokens de auth, etc.).
3. Implementar SPs para autenticación, usuarios, catálogos, ingresos, egresos, inversiones, metas, fechas de corte y dashboard; las firmas están definidas en los tickets de API.
4. Poblar catálogos con valores por defecto (tipos de ingreso/egreso, frecuencias, destinos, procedencias).
5. Entregar README con matriz Endpoint ↔ SP y listado de códigos de error.

## Auditoría del dump actual
- Columnas sin `AUTO_INCREMENT` y con nombres inconsistentes (`periocidad i`, `Bandera`, etc.).
- FKs circulares (`usuario` depende de `ingreso` y viceversa).
- Tipos de dato incorrectos (`cantidad` INT donde debería ser DECIMAL).
- Falta de tablas para `procedencias`, `frecuencias`, `fechas_corte_ahorro`, `auth_tokens`.
- Nombres mal escritos (`prosedencia`, `usariosprosedencia`).
> Acción: reconstruir esquema completo con nombres en snake_case y claves primarias autoincrementales.

## Modelo propuesto (tablas principales)
### usuarios
- `id` INT PK AI
- `nombre`, `apellido_p`, `apellido_m` VARCHAR(80)
- `correo` VARCHAR(120) UNIQUE
- `fecha_nacimiento` DATE
- `password_hash` VARCHAR(72)
- `activo` TINYINT(1) DEFAULT 1
- `creado_en`, `actualizado_en` DATETIME DEFAULT CURRENT_TIMESTAMP

### auth_tokens
- `id` BIGINT PK AI
- `usuario_id` FK → usuarios.id
- `token` CHAR(36) UNIQUE
- `tipo` ENUM('RESET_PASSWORD')
- `expira_en` DATETIME
- `usado` TINYINT(1) DEFAULT 0
- Índice `(usuario_id, tipo, expira_en)`

### catálogos compartidos
- `tipos_ingreso`, `tipos_egreso`, `destinos`, `procedencias`
  - `id` INT PK AI
  - `usuario_id` FK → usuarios.id (NULL para valores globales)
  - `nombre` VARCHAR(100) UNIQUE con índice compuesto `UNIQUE(usuario_id, nombre)`
  - `es_por_defecto` TINYINT(1)
  - `creado_en`, `actualizado_en` DATETIME
- Datos seed (globales):
  - Tipos ingreso: Efectivo, Transferencia, Cheque, Tarjeta, Vales, Bonos.
  - Tipos egreso: Efectivo, Transferencia, Cheque, Tarjeta, Vales, Bonos.
  - Destinos: Renta, Servicios, Transporte, Alimentación.
  - Procedencias: Empresa, Freelance, Negocio propio.

### frecuencias
- `id` INT PK AI
- `nombre` VARCHAR(60) UNIQUE
- `creado_en`, `actualizado_en`
- Seed: Diario, Semanal, Quincenal, Mensual, Bimestral, Trimestral, Semestral, Anual.

### ingresos / egresos
- `id` BIGINT PK AI
- `usuario_id` FK usuarios.id
- `tipo_id` FK tipos_ingreso/egreso.id
- `procedencia_id` FK procedencias.id (ingresos, nullable)
- `destino_id` FK destinos.id (egresos, nullable)
- `monto` DECIMAL(12,2)
- `descripcion` VARCHAR(255) NULL
- `fecha_inicio`, `fecha_fin` DATETIME NULL
- `frecuencia_id` FK frecuencias.id NULL
- `creado_en`, `actualizado_en`, `eliminado_en`
- Índices sugeridos: `(usuario_id, fecha_inicio)`, `(usuario_id, tipo_id)`, `(usuario_id, procedencia_id)` / `(usuario_id, destino_id)`

### inversiones
- Campos: `destino_id` NULL, `monto`, `objetivo` VARCHAR(120), `tasa_interes` DECIMAL(5,2), mismas fechas y tracking que ingresos.

### metas
- `monto_objetivo` DECIMAL(12,2)
- `ahorro_real` DECIMAL(12,2)
- `activa` TINYINT(1)
- `fecha_inicio`, `fecha_fin`, tracking de auditoría.
- Índice `(usuario_id, activa, fecha_inicio)`

### fechas_corte_ahorro
- `id` INT PK AI
- `usuario_id` FK usuarios.id
- `fecha_corte` DATETIME
- `creado_en` DATETIME DEFAULT CURRENT_TIMESTAMP
- Índice único `(usuario_id, fecha_corte)`

### recompensas (opcional)
- Evaluar si se mantiene; no está en módulos actuales. Si se conserva, normalizar campos (`tipo`, `usuario_id`).

## Convenciones para SPs
- Prefijo por módulo (`sp_ingresos_*`, `sp_catalogos_*` opcional).
- Todos devuelven campos con alias en español (p. ej. `SELECT id AS ingresoId`).
- Paginación: parámetros `pPagina INT`, `pTam INT`, `LIMIT (pPagina-1)*pTam, pTam`.
- Orden: parámetro `pOrden` validado con lista blanca; aplicar `CASE` o concatenar usando `FIELD`.
- Errores: `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='CODIGO:Mensaje legible'`.
  - `DATOS_INVALIDOS`, `DUPLICADO`, `FK_INEXISTENTE`, `NO_ENCONTRADO`, `PERMISO_DENEGADO`, `EN_USO`, `TOKEN_INVALIDO`, `TOKEN_EXPIRADO`.
- SPs de mutación retornan un result set con flags (`actualizado`, `eliminado`) para integrarse con la API.

## SPs a entregar (referencia)
- Autenticación: `sp_usuarios_registrar`, `sp_auth_acceso`, `sp_auth_olvido_iniciar`, `sp_auth_restablecer_confirmar`.
- Usuarios: `sp_usuarios_obtenerPorId`, `sp_usuarios_actualizar`, `sp_usuarios_cambiarContrasena`.
- Catálogos: `sp_tiposIngreso_*`, `sp_tiposEgreso_*`, `sp_destinos_*`, `sp_procedencias_*`, `sp_frecuencias_*`.
- Movimientos: `sp_ingresos_listar/crear/obtener/actualizar/eliminar`, `sp_egresos_*`, `sp_inversiones_*`.
- Metas y ahorro: `sp_metas_*`, `sp_fechasCorte_listar/crear/eliminar`.
- Dashboard: `sp_dashboard_resumen`, `sp_dashboard_balance`, `sp_dashboard_metas` (multi result set).

## Índices y performance
- Añadir índices mencionados en los tickets de API para evitar full scans.
- Considerar índices compuestos para dashboards (`ingresos(usuario_id, fecha_inicio)` y `egresos(usuario_id, fecha_inicio)`).
- Usar `EXPLAIN` en SPs críticos y documentar resultados básicos.

## Entregables
- `schema.sql`: creación de base normalizada + seeds.
- `stored_procedures.sql`: definición de todos los SPs (grupados por módulo).
- `seed_catalogos.sql`: inserts iniciales (tipos, frecuencias, destinos, procedencias).
- `README.md` (BD): describe dependencias, convención de errores, enlace a endpoints que consumen cada SP y checklist para QA de BD.

## Pruebas recomendadas
- Scripts de smoke test (p. ej. `CALL sp_ingresos_crear...`) para validar FKs y errores.
- Probar triggers/SPs de seguridad (no permitir borrar catálogos en uso).
- Verificar conversión a UTC mediante `CONVERT_TZ` si la app provee fechas locales.
