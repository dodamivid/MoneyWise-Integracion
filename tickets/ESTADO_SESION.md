# Estado de sesión — MoneyWise Integración

**Generado:** 2026-09-17
**Cubre:** sesión larga del 2026-09-09 (issue #67) al 2026-09-17 (issue #87 + barrido de endpoints)
**Método:** este documento se armó cruzando `git log --oneline -30`, `git status`, `git diff HEAD`, `gh issue list`, y lectura directa de código — no solo memoria de la conversación. Donde algo viene solo de memoria (no verificado en esta pasada), se marca explícitamente como **[memoria, no re-verificado]**.

---

## 1. Resumen por issue

### #67 — Esquema legado marcado correctamente
- Movió `tickets/Dump20251015 (1).sql` → `docs/historico/Dump20251015 (1).sql` con banner "NO USAR".
- Nuevo `docs/historico/README.md` con la comparación esquema legado vs. canónico y nota sobre `recompensas` (fuera de alcance).
- `README.md`/`README_DEPLOY.md`: apuntan a `db/moneywise_schema.sql` como única fuente de verdad.
- PR #69, mergeado. **Verificado en git log**: commit `886b44d`.

### #68 — `frecuencias` catálogo global, escritura solo admin
- Decisión: `frecuencias` es global a propósito (enum de calendario), no per-usuario.
- `POST/PUT/DELETE /api/v1/catalogos/frecuencias` → requieren scope `admin:catalogos`.
- PR #70, mergeado. **Verificado en git log**: commit `6609f13`.

### #73 — CRÍTICO: `db.call()` no pasaba parámetros a los SPs
- `src/config/db.ts`: `db.call()` armaba `` `CALL ${sp}` `` sin placeholders `?`; `sqlstring` descartaba los parámetros en silencio.
- Fix: generar `CALL sp_nombre(?, ?, ...)` con un placeholder por parámetro.
- Nuevo `__tests__/tests/unit/db.test.ts`.
- PR #74, mergeado. **Verificado en git log**: commit `4fbbfdc`.
- **Importante para el futuro**: los "datos de 2025" que parecían reales en `ingresos` durante la investigación eran en realidad un mock hardcodeado (`ingresos.repository.ts`) que se activaba cuando la llamada real a MySQL fallaba en silencio. No fueron datos reales nunca.

### #75 — CRÍTICO: los 10 SPs `_listar` con error de sintaxis real
- `ORDER BY ... LIMIT ... UNION ALL ...` sin paréntesis es un error de sintaxis real de MySQL (1064), no un detalle de estilo.
- Se agregaron paréntesis al primer `SELECT` en los 10 SPs `_listar` de `db/moneywise_schema.sql` (destinos, frecuencias, procedencias, tiposIngreso, tiposEgreso, ingresos, egresos, inversiones, metas, fechasCorte).
- Bonus fix: `catalogosProcedencia.repository.ts` calculaba el total desde la primera fila del `UNION ALL` en vez de la última, y dejaba colar la fila de `COUNT(*)` como registro real.
- Esquema reimportado en Railway (`node scripts/import-db.js`).
- PR #76, mergeado. **Verificado en git log**: commit `852e923`.
- Issue #72 (relacionado) se cerró como inválido — estaba basado en un error de búsqueda propio (se buscó `sp_tipos_ingreso_*` con guion bajo; el nombre real es `sp_tiposIngreso_*` en camelCase).

### #71 — Catálogos conectados a sus SPs
- `destinos`, `frecuencias` (en `catalogos.repository.ts`) y `tipos_egreso` (`tiposEgreso.repository.ts`) conectados a sus stored procedures reales, con fallback en memoria si `DB_ENABLED`/`USE_DB` está apagado.
- Se corrigió el matching de errores en `catalogosProcedenciaService`/`tiposEgresoService` (comparaban contra frases en español que nunca coincidían con el formato real `"CODIGO:mensaje"` que lanzan los SPs).
- Nuevo `__tests__/tests/unit/catalogos-db.test.ts`.
- PR #78, mergeado. **Verificado en git log**: commit `06e8a66`.

### #80 — REGRESIÓN CRÍTICA: doble paréntesis en `db.call()`
- El fix de #73 rompió `auth.repository.ts` y `dashboard.repository.ts`, que ya pasaban el nombre del SP **con** paréntesis/placeholders incluidos como workaround propio (`"sp_x(?, ?)"`). Con el fix de #73 sumado, terminaba en `CALL sp_x(?, ?)(?, ?)` — sintaxis inválida.
- Rompía: registro, login, recuperación de contraseña, y los 3 endpoints de dashboard.
- Fix: se normalizaron los 7 call sites a pasar solo el nombre; `db.call()` ahora es defensivo (toma solo el texto antes del primer `(`).
- PR #81, mergeado. **Verificado en git log**: commit `5476de7`.
- Encontrado haciendo pruebas de **escritura** real (POST) contra Railway por primera vez — las verificaciones anteriores de #73/#75/#71 solo habían cubierto lecturas.

### #82 — CRÍTICO: `es_por_defecto` mal calculado
- `sp_destinos_crear`, `sp_procedencias_crear`, `sp_tiposEgreso_crear`, `sp_tiposIngreso_crear` insertaban `es_por_defecto = IFNULL(pUsuarioId, 0)` — cuando `pUsuarioId` no es NULL (caso normal), esto guardaba el **id del usuario** en `es_por_defecto`, no `0`. Como la API lee esa columna con `Boolean(esPorDefecto)`, cualquier valor no-cero da `true` → el usuario quedaba bloqueado para editar/eliminar **sus propios** catálogos.
- Fix: `VALUES (pUsuarioId, vNombre, 0)` en las 4 SPs.
- Aplicado directo a la base (reimport) y luego el PR #83 sincronizó `main`. **Verificado en git log**: commit `0c26c89`.

### #84 — CRÍTICO: fechas ISO rechazadas por MySQL + fallback mentiroso
- El bug más grave de la sesión. Dos causas combinadas:
  1. La API acepta fechas ISO-8601 (`2026-01-01T00:00:00Z`) pero se pasaban tal cual a MySQL, que las rechaza para columnas `DATETIME` ("Incorrect datetime value").
  2. `ingresos.repository.ts` y `egresos.repository.ts` tragaban cualquier error no reconocido y devolvían un **ID inventado con `Math.random()`** como si hubiera funcionado. `inversiones.repository.ts` tenía el mismo patrón con fallback en memoria.
- Resultado: **ningún ingreso/egreso/inversión creado vía API se guardaba de verdad** hasta este fix, aunque la API respondía `201 Created`.
- Fix: nueva utilidad `src/utils/mysqlDate.ts` (`toMySQLDateTime`), aplicada en ingresos/egresos/inversiones/dashboard. Se quitó el catch-y-mentir: con `DB_ENABLED` activo, un error real ahora se propaga como error real.
- Nuevo `__tests__/tests/unit/mysqlDate.test.ts`.
- PR #85, mergeado. **Verificado en git log**: commit `727e587`.

### #79 — SEGURIDAD: credenciales reales expuestas
- `API_KEY`, `JWT_SECRET` y `DB_PASSWORD` reales en texto plano en `README_DEPLOY.md`, `README_API.md` y `tickets/demo.js` (este último también tenía un JWT real firmado), repo público, desde nov. 2025 (~10 meses).
- Las 3 credenciales se **rotaron de verdad** en Railway (contraseña MySQL vía `ALTER USER` corrido por el usuario en la consola de Railway; API_KEY/JWT_SECRET regenerados y pegados en Variables del servicio web).
- Valores reales reemplazados por placeholders en los 3 archivos. `.gitignore` ahora cubre `.env`/`.env.local`/`.env.*.local` y `dist/`.
- Verificado en vivo: la API_KEY vieja da 401, la nueva funciona.
- PR #86, mergeado. **Verificado en git log**: commit `f2f379a`.
- **Nota**: los valores viejos quedan en el historial de git de todos modos (ya no son válidos, así que no es un riesgo adicional real).

### #77 — `tipos-ingreso` rediseñado
- El módulo tenía un `TipoIngresoDTO` con `descripcion`/`activo` (columnas que **nunca existieron** en la tabla `tipos_ingreso`) en vez de `usuarioId`/`esPorDefecto`.
- Estaba montado en `/api/v1/tipos-ingreso` (sin auth) en vez de `/api/v1/catalogos/tipos-ingreso` — el propio ticket original (`tickets/API_catalogo_tipos_ingreso.md`) ya especificaba la ruta bajo `/catalogos`.
- Sin ningún middleware de auth aplicado.
- Se reescribieron DTO/repository/service/controller/routes calcados del patrón de `tipos_egreso`. Se agregó `__tests__/tests/integration/tiposIngreso.test.ts` (no existían tests antes). Se actualizaron referencias en `README_API.md`, `README_DEPLOY.md` y la colección de Postman.
- PR #88, mergeado. **Verificado en git log**: commit `ab82d9d`. **Confirmado CLOSED en GitHub** (`gh issue view 77` → `state: CLOSED`, cerrado 2026-09-17 05:34 UTC).

### #87 — `metas` conectado a sus SPs
- `metas.repository.ts` era puro en memoria (`Map`). Se conectó a `sp_metas_listar/crear/obtener/actualizar/eliminar`, preservando la interfaz pública existente para no tocar `metas.service.ts`/`metas.controller.ts` más de lo necesario.
- Único cambio de firma: `delete(metaId, usuarioId)` — el SP exige `usuarioId` para su propio `WHERE usuario_id = ?`; el service ya validaba el dueño antes de llamar al repo, así que es defensa en profundidad, no cambio de comportamiento.
- Los 25 tests de integración existentes de `metas.test.ts` siguen pasando sin cambios (corren contra el fallback en memoria). Nuevo `__tests__/tests/unit/metas-db.test.ts`.
- PR #90, mergeado. **Verificado en git log**: commit `c6f534b`.

### #89 — metas sin auth — ⚠️ CERRADO PERO NO RESUELTO
- Se abrió como seguimiento de #77 (mismo patrón: `metas.routes.ts` sin `mockAuth`/`requireScope`), deliberadamente **fuera de alcance** de #87 para no mezclar un cambio de auth con el de persistencia.
- **`gh issue view 89` muestra `state: CLOSED`, `stateReason: COMPLETED`, cerrado 2026-09-17 13:19 UTC.**
- **Pero no hay ningún commit que lo mencione** (`git log --all --grep="#89"` no devuelve nada) **y `src/routes/metas.routes.ts` sigue sin ningún `mockAuth`/`requireScope` aplicado** (verificado con grep en esta misma sesión).
- **Conclusión: el issue se cerró sin que el problema se haya arreglado.** No fue Claude quien lo cerró. Probablemente se cerró manualmente por error desde GitHub. **Recomendación: reabrirlo**, o si se decide que no es prioridad, dejarlo así pero con un comentario explicando por qué se cierra sin fix.

### #91 — `dashboard/balance` es función muerta (abierto, no bloquea #65)
- Encontrado durante el barrido final de endpoints: `GET /api/v1/dashboard/balance` siempre da `404 NO_ENCONTRADO:No hay fechas de corte registradas` porque depende de la tabla `fechas_corte_ahorro`, y **no existe ningún endpoint** para crear/listar fechas de corte — ni rutas, ni controller, ni service, ni repository.
- Los SPs (`sp_fechasCorte_listar/crear/eliminar`) ya existen en la base.
- Ya existe el ticket de spec original: `tickets/API_fechas_corte.md` (ruta propuesta: `/api/v1/ahorro/fechas-corte`, scopes `ahorro:leer`/`ahorro:escribir`) — nunca se implementó.
- No bloquea #65.

---

## 2. Archivos modificados o creados en la sesión

**Nota**: esta lista viene de memoria de los commits hechos, no de un diff exhaustivo (el working tree está limpio ahora — `git status` → "nothing to commit"). Para el detalle línea por línea de cada cambio, ver los commits listados arriba con `git show <hash>`.

| Archivo | Qué cambió |
|---|---|
| `src/config/db.ts` | `db.call()` arreglado (placeholders) y hecho defensivo (#73, #80) |
| `db/moneywise_schema.sql` | Paréntesis en 10 SPs `_listar` (#75); `es_por_defecto` corregido en 4 SPs `_crear` (#82); comentarios de convención agregados |
| `src/repositories/catalogos.repository.ts` | destinos/frecuencias conectados a SPs (#71) |
| `src/repositories/catalogosProcedencia.repository.ts` | Fix de mapeo de fila total + matching de errores (#71/#75) |
| `src/repositories/tiposEgreso.repository.ts` | Conectado a SPs (#71) |
| `src/services/catalogos.service.ts`, `catalogosProcedencia.service.ts`, `tiposEgreso.service.ts` | Matching de errores `CODIGO:` (#71) |
| `src/repositories/auth.repository.ts`, `dashboard.repository.ts` | Fix doble paréntesis (#80) |
| `src/utils/mysqlDate.ts` | **Nuevo** — conversión ISO→MySQL DATETIME (#84) |
| `src/repositories/ingresos.repository.ts`, `egresos.repository.ts`, `inversiones.repository.ts` | `toMySQLDateTime` aplicado + quitado el fallback mentiroso (#84) |
| `src/repositories/dashboard.repository.ts` | `toMySQLDateTime` aplicado (#84) |
| `README_DEPLOY.md`, `README_API.md`, `tickets/demo.js` | Credenciales reales → placeholders (#79) |
| `.gitignore` | `.env*`, `dist/` agregados (#79) |
| `src/dtos/tiposIngreso.dto.ts`, `repositories/`, `services/`, `controllers/`, `routes/tiposIngreso.*` | Reescritos completos (#77) |
| `src/app.ts` | Mount de `tiposIngresoRoutes` movido a `/api/v1/catalogos` (#77) |
| `docs/api/postman/moneywise.postman_collection.json` | Ruta de tipos-ingreso actualizada (#77) |
| `src/repositories/metas.repository.ts` | Reescrito completo, conectado a SPs, interfaz pública preservada (#87) |
| `src/services/metas.service.ts` | Un call site actualizado (`delete(metaId, usuarioId)`) (#87) |
| `__tests__/tests/unit/db.test.ts` | **Nuevo** (#73), ampliado (#80) |
| `__tests__/tests/unit/catalogos-db.test.ts` | **Nuevo** (#71) |
| `__tests__/tests/unit/mysqlDate.test.ts` | **Nuevo** (#84) |
| `__tests__/tests/unit/metas-db.test.ts` | **Nuevo** (#87) |
| `__tests__/tests/integration/tiposIngreso.test.ts` | **Nuevo** (#77) |
| `docs/historico/README.md` | **Nuevo** (#67) |

---

## 3. Endpoints — estado de verificación

**PROBADO EN VIVO** = confirmado con `curl` contra Railway en esta sesión, con verificación adicional por `SELECT` directo a MySQL cuando aplicaba.
**PROBADO SOLO CON JEST** = pasa la suite automatizada (corre contra el fallback en memoria, `DB_ENABLED` apagado en tests) pero no se ejecutó manualmente contra Railway.
**NO PROBADO** = ni curl ni jest específico.

| Endpoint | Estado | Detalle |
|---|---|---|
| `POST /api/v1/auth/registro` | ✅ PROBADO EN VIVO | Usuario real creado |
| `POST /api/v1/auth/acceso` | ✅ PROBADO EN VIVO | Login real, JWT emitido |
| `POST /api/v1/auth/olvido` | ✅ PROBADO EN VIVO | Token real generado en `auth_tokens`, confirmado con `SELECT` |
| `POST /api/v1/auth/restablecer` | ✅ PROBADO EN VIVO | Flujo completo: reset → login con contraseña nueva → token reusado correctamente rechazado (400) |
| `GET/POST/PATCH/DELETE /api/v1/ingresos` | ✅ PROBADO EN VIVO | CRUD completo, incluye 404 en doble DELETE |
| `GET/POST/PATCH/DELETE /api/v1/egresos` | ✅ PROBADO EN VIVO | CRUD completo |
| `GET/POST/PATCH/DELETE /api/v1/inversiones` | ✅ PROBADO EN VIVO | CRUD completo incluyendo GET por id |
| `GET/POST/PATCH/DELETE /api/v1/metas` | ✅ PROBADO EN VIVO | CRUD completo, `ahorro_real`/`eliminado_en` confirmados por `SELECT` directo |
| `GET /api/v1/dashboard/resumen` | ✅ PROBADO EN VIVO | Reflejó totales reales (ingresos/egresos/balance) |
| `GET /api/v1/dashboard/metas-vs-ahorro` | ✅ PROBADO EN VIVO | 200, respuesta correcta (vacía porque no había metas activas en ese momento) |
| `GET /api/v1/dashboard/balance` | ❌ **FALLA (esperado/función muerta)** | `404 NO_ENCONTRADO:No hay fechas de corte registradas` — no existe forma de registrar una fecha de corte por API. Ver issue #91 |
| `GET/POST/PUT/DELETE /api/v1/catalogos/destinos` | ✅ PROBADO EN VIVO | CRUD completo + duplicado (400) + bloqueo de default |
| `GET/POST/PUT/DELETE /api/v1/catalogos/procedencias` | ✅ PROBADO EN VIVO | CRUD completo |
| `GET/POST/PUT/DELETE /api/v1/catalogos/tipos-egreso` | ✅ PROBADO EN VIVO | CRUD completo |
| `GET/POST/PUT/DELETE /api/v1/catalogos/tipos-ingreso` | ✅ PROBADO EN VIVO | CRUD completo incluyendo 409 duplicado y 404 doble delete |
| `GET /api/v1/catalogos/frecuencias` | ✅ PROBADO EN VIVO | Lectura libre confirmada |
| `POST/PUT/DELETE /api/v1/catalogos/frecuencias` | ✅ PROBADO EN VIVO | Confirmado el bloqueo 403 sin `admin:catalogos` |
| `GET/PUT/PATCH /api/users/:id` | ⚠️ Comportamiento esperado, no es un bug | Módulo legacy en memoria, separado de `auth`. Sin endpoint de creación (ver sección 6). 404 porque el Map está vacío |
| `GET /api/v1/version`, `GET /health` | ✅ PROBADO EN VIVO (implícito) | Usados repetidamente como sanity check durante toda la sesión |

**Nota sobre encoding**: el mensaje de error "Token de restablecimiento inválido" sale como "invÃ¡lido" (problema de encoding/mojibake). Cosmético, no investigado a fondo, bajo prioridad.

**Nota sobre timezone**: se observó un corrimiento de ~6 horas en algunas `fecha_inicio` leídas de vuelta (ej. se mandó `00:00:00Z` y se leyó `06:00:00Z`). **[memoria, no re-verificado en esta pasada]** — posible tema de zona horaria de sesión MySQL vs. UTC. No bloquea nada, pero vale la pena investigarlo antes de confiar en reportes de fecha exactos.

---

## 4. Decisiones tomadas y por qué

1. **`frecuencias` es global, no per-usuario** (#68) — es un enum de calendario cerrado (Diario, Semanal...), no algo que un usuario personalice como sus destinos. Escritura restringida a `admin:catalogos`.
2. **Rotar credenciales en vez de solo limpiar el README** (#79) — un repo público ya expuesto se asume visto/indexado; borrar el valor del archivo actual no revierte nada retroactivo.
3. **`tipos-ingreso` se rediseñó completo en vez de parchear** (#77) — el DTO no coincidía con la tabla real (tenía columnas que nunca existieron); no había forma de "conectar" sin antes arreglar el modelo.
4. **`metas` preservó su interfaz pública al conectar a SPs** (#87) — para no tocar `metas.service.ts`/`metas.controller.ts` más de lo estrictamente necesario y no romper los 25 tests de integración existentes que ya pasaban.
5. **Auth de `metas` (#89) se dejó fuera de #87 a propósito** — para no mezclar un cambio de auth con uno de persistencia en el mismo PR. Quedó pendiente (ver advertencia arriba: el issue se cerró sin el fix).
6. **`update()` de metas no valida dueño** (comportamiento preexistente, se mantuvo) — el service nunca lo validó ahí (solo en `delete`); cambiar eso hubiera sido ensanchar el alcance de #87 hacia el problema de auth que le corresponde a #89.
7. **`dashboard/balance` (#91) no se implementó, solo se documentó** — hubiera significado construir un módulo CRUD completo nuevo (`fechasCorte.*`), fuera del alcance de "verificar antes de #65".

---

## 5. Bugs / deuda técnica encontrada, pendiente

| Item | Estado | Detalle |
|---|---|---|
| #89 — metas sin auth | **Cerrado sin resolver** (ver sección 1) | Recomendación: reabrir |
| #91 — dashboard/balance función muerta | Abierto | Falta módulo `fechasCorte.*` completo. Spec ya existe en `tickets/API_fechas_corte.md` |
| Encoding roto en mensajes de error | No hay issue abierto | "invÃ¡lido" en vez de "inválido", visto en `restablecer`. Cosmético |
| Corrimiento de ~6h en fechas leídas | No hay issue abierto, **[memoria, no re-verificado]** | Posible tema de timezone de sesión MySQL |
| `eslint.config.js` roto | No hay issue abierto | Usa `import` ES module sin `"type":"module"` en `package.json`; `npm run lint` crashea por completo, no solo da warnings |
| `/api/users/*` (legacy) sigue en memoria, sin endpoint de creación | Documentado, no es un bug nuevo | Ya estaba así antes de esta sesión (ver CLAUDE.md histórico); no hay forma de poblarlo vía API |
| `db/stored-procedures/sp_usuarios.sql` | No investigado | Archivo separado de `db/moneywise_schema.sql` (la fuente de verdad desde #67) — posible contenido duplicado/obsoleto, no se revisó en esta sesión |

---

## 6. Qué falta antes de pasar al #65

**Nada bloqueante.** Todos los endpoints que #65 (seed de datos transaccionales: ingresos, egresos, inversiones, metas) necesita para funcionar de verdad ya están confirmados en vivo contra MySQL real:
- Usuarios reales se pueden crear (`POST /api/v1/auth/registro`) — el `usuarios` table SÍ es real y persistente (vía `auth`, no vía el módulo legacy `/api/users`).
- Los 4 tipos de movimiento (ingresos/egresos/inversiones/metas) persisten de verdad, con fechas correctas.
- Los catálogos que los movimientos referencian (tipos, destinos, procedencias) persisten y tienen datos seed reales.

**Recomendación antes de arrancar #65**: decidir qué hacer con el #89 reabierto/cerrado-sin-resolver — no es bloqueante para #65 en sí, pero como #65 va a crear datos de prueba masivos vía `metas`, conviene saber que ese endpoint sigue sin ninguna protección de auth real (cualquiera puede crear/leer/borrar metas de cualquier usuario con solo mandar el `usuarioId` que quiera en el body).

---

## 7. Siguiente paso exacto para retomar en sesión nueva

1. Leer este archivo (`tickets/ESTADO_SESION.md`) completo antes de tocar código.
2. Confirmar con el usuario qué hacer con #89 (¿reabrir? ¿dejarlo así?).
3. Arrancar el issue **#65 — Seed de datos transaccionales**:
   - Revisar `tickets/API_ingresos.md`, `API_egresos.md`, `API_inversiones.md`, `API_metas.md` para los contratos exactos de creación.
   - Diseñar el script de seed (probablemente Node, usando los endpoints reales vía `auth` + los módulos ya conectados) — **no** sembrar directo a SQL para no saltarse la validación de negocio real.
   - Antes de correr el seed contra Railway (producción real), confirmar con el usuario si se quiere limpiar la base primero (`node scripts/import-db.js` resetea todo) o sembrar sobre lo que ya haya.
4. Repo en `main`, limpio, sin ramas sueltas (verificado: `git status` → "nothing to commit", solo rama `main`).
