# Estado de sesión — MoneyWise Integración

**Generado:** 2026-09-17. Actualizado 2026-09-18 (#91) y 2026-09-19 (#96, #97, CI con lint+build, suite `test:db` contra MySQL real y fix de zona horaria — cierre de la fase 1).
**Cubre:** sesión larga del 2026-09-09 (issue #67) al 2026-09-19. **Fase 1 (API `MoneyWise-Integracion`) cerrada**; la fase 2 es el repo aparte `dodamivid/MoneyWise-DataLake` (ver sección 7).
**Método:** este documento se armó cruzando `git log`, `git status`, `git diff --stat`, `gh issue list`, `gh run list` y lectura directa de código — no solo memoria de la conversación. La lista de archivos de la sección 2 posterior al #91 sale de `git diff --stat 1302f0e HEAD`. Donde algo viene solo de memoria (no verificado en esta pasada), se marca explícitamente como **[memoria, no re-verificado]**.

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

### #89 — metas sin auth — ✅ RESUELTO (esta vez sí, verificado en vivo)
- Se abrió como seguimiento de #77 (mismo patrón: `metas.routes.ts` sin `mockAuth`/`requireScope`), deliberadamente **fuera de alcance** de #87 para no mezclar un cambio de auth con el de persistencia.
- Se había cerrado en GitHub (`stateReason: COMPLETED`) sin ningún commit real — confirmado con `git log --all --grep="#89"` (vacío) y grep en `metas.routes.ts` (sin `mockAuth`/`requireScope`) al retomar la sesión. Se **reabrió** con `gh issue reopen 89` antes de tocar código.
- Fix: `router.use(mockAuth)` + `requireScope("metas:leer"/"metas:escribir")` en `metas.routes.ts`, mismo patrón que `ingresos`/`egresos`/`inversiones`/`catalogos`. Se agregaron los scopes `metas:leer`/`metas:escribir`/`admin:metas` a la lista de scopes por defecto de `mockAuth` (`auth.middleware.ts`). Se actualizaron los 25 tests de integración existentes para mandar `x-mw-user`/`x-mw-scopes` (antes pasaban sin auth porque no había middleware que la exigiera) y se agregaron 2 tests nuevos de 403.
- PR #92, mergeado (commit `791f87f`).
- **Verificado en vivo contra Railway tras el deploy** (no solo Jest): `GET /metas` sin `metas:leer` → 403; con el scope → 200; `POST /metas` sin `metas:escribir` → 403; `POST /metas` con el scope → 201 y persistencia real confirmada con `GET /metas/:id`; `DELETE` con `usuarioId` equivocado en el body → 400 (el ownership check de `DELETE` se preservó); `DELETE` con el `usuarioId` correcto → 200. Usuario de prueba real creado vía `/auth/registro` (`usuarioId: 2`) y la meta de prueba se limpió al final (soft-delete).
- **Lo que sigue sin resolver a propósito** (era mejora opcional del issue, no su defecto principal): `POST`/`GET` siguen confiando en el `usuarioId` que manda el cliente en vez de derivarlo de una identidad verificada; `PATCH` sigue sin validar dueño (`DELETE` sí). Es el mismo patrón que el resto de la API — no hay JWT real conectado a `mockAuth` todavía.

### #65 — Seed de datos transaccionales — ✅ RESUELTO (verificado en vivo)
- Antes de sembrar se revisó el estado real de la base vía API (sin credenciales de MySQL directas): `ingresos`/`egresos`/`inversiones`/`metas` ya estaban en 0 filas (se habían limpiado solas durante los bugs de la sesión anterior), y los catálogos ya tenían su seed global. Se decidió **sembrar directo, sin reset** (un `import-db.js` no aportaba nada y era más riesgo).
- Nuevo `scripts/seed-transaccional.js`: siembra vía los endpoints reales de la API (no SQL directo, para pasar por las mismas validaciones de negocio que un cliente real). Requiere solo `MWI_API_URL`/`MWI_API_KEY` (no credenciales de MySQL).
- 5 usuarios de ejemplo registrados vía `/auth/registro` (`ana.martinez.seed@…`, `luis.hernandez.seed@…`, `sofia.ramirez.seed@…`, `diego.flores.seed@…`, `valeria.morales.seed@…`, password fijo `SeedMW2026!`), cada uno con 12 meses de historia: sueldos quincenales + bonos ocasionales (ingresos), ~10 categorías de egresos variables, 2-4 inversiones, 2-3 metas con progreso real (`PATCH ahorroReal`, no solo creadas en 0).
- Cada usuario crea sus propios destinos extra (`Salud`, `Educación`, `Entretenimiento`, `Ropa`, `Mascotas`, `Impuestos`) vía `POST /catalogos/destinos` — **no se amplió el catálogo global** de destinos en la Railway real (eso requeriría credenciales de MySQL que no se compartieron en esta sesión; solo se compartió la `API_KEY` de aplicación). Sí se agregó al seed global en `db/moneywise_schema.sql` (4→10 destinos) para que un futuro reimport lo traiga de una vez.
- Idempotente a nivel usuario+recurso: se verificó corriendo el script dos veces seguidas sobre el mismo usuario — la segunda vez no crea nada (`ingresos: ya tiene N, se salta`, etc.). **No** es idempotente fila-por-fila (no completa un sembrado parcial).
- **Ejecutado en vivo contra Railway**: 5 usuarios, **139 ingresos, 1686 egresos, 17 inversiones, 14 metas — 100% creados sin errores**. `GET /dashboard/resumen` confirmado con ingresos/egresos/balance reales y != 0 para los 5 usuarios (ej. usuarioId 3: ingresos $173,493.66, egresos $232,885.55, balance -$59,391.89, con desglose real por tipo/procedencia/destino). `GET /dashboard/metas-vs-ahorro` confirmado con metas y `ahorroReal`/`porcentajeAvance` reales.
- `npx jest` completo: 74/74 sigue pasando.
- PR #93, **mergeado** (commit `bf3a37f`). Quedó pendiente al cierre de la sesión anterior por el clasificador de permisos del entorno; el usuario (o un retry posterior) lo mergeó — confirmado con `gh pr view 93` → `mergedAt` no nulo.
- **Lo que NO se sembró**: `fechas_corte_ahorro` — no existía ningún endpoint para crearla en ese momento (issue #91). Resuelto después, en la misma sesión siguiente — ver abajo.

### #91 — `dashboard/balance` era función muerta — ✅ RESUELTO (verificado en vivo)
- Nuevo módulo `fechasCorte` (dto/repository/service/controller/routes), calcado del patrón de `tiposEgreso`, conectado a los SPs `sp_fechasCorte_listar/crear/eliminar` que ya existían en el esquema pero no tenían nada en `src/` que los llamara.
- Montado en `/api/v1/ahorro/fechas-corte` (GET/POST/DELETE) con `mockAuth`/`requireScope("ahorro:leer"/"ahorro:escribir")`, tal como especifica `tickets/API_fechas_corte.md`. `usuarioId` se deriva de `res.locals.auth` (headers `x-mw-user`), igual que ingresos/egresos/inversiones — no del body como en `metas`.
- Nuevos tests: `fechasCorte-db.test.ts` (unit, UNION ALL + conversión de fecha) y `fechasCorte.test.ts` (integración, CRUD + 403 + 409 + 422).
- PR #94, mergeado (commit `100e637`).
- **Bug adicional encontrado al verificar en vivo**: tras crear una fecha de corte real para un usuario con ~$173k en ingresos sembrados, `GET /dashboard/balance` seguía devolviendo `ingresosAcumulados: 0, egresosAcumulados: 0, balanceAcumulado: 0`. Causa: `DashboardService.balance()` leía `row.ingresos`/`row.egresos`/`row.balance`, pero `sp_dashboard_balance` devuelve las columnas como `ingresosAcumulados`/`egresosAcumulados`/`balanceAcumulado` — nombres que no existían en la fila, así que siempre caía al `|| 0`. No había ningún test de `dashboard/balance` antes de esto (nuevo `dashboard-balance.test.ts`). Fix en PR #95, mergeado (commit `6e2141c`).
- **Verificado en vivo contra Railway, end-to-end, en ese orden exacto**: `GET /dashboard/balance` → 404 (sin fecha de corte) → `POST /ahorro/fechas-corte` → 201 → `POST` duplicada → 409 → `GET /dashboard/balance` → **200 con `ingresosAcumulados: 173493.66, egresosAcumulados: 232885.55, balanceAcumulado: -59391.89`**, coincidiendo exacto con lo que ya mostraba `dashboard/resumen` para ese mismo usuario.
- **Hallazgo aparte** (resuelto después en #97, ver abajo): `dist/` seguía trackeado en git a pesar de que `.gitignore` lo incluía desde el #79.
- `npx jest` completo: 87/87.

### #97 — `dist/` trackeado en git pese a `.gitignore` — ✅ RESUELTO
- Arrastre de PRs anteriores al #79: `.gitignore` no destrackea lo que ya estaba commiteado, así que `npm run build` local generaba diffs enormes de JS compilado en cualquier PR.
- Fix: `git rm -r --cached dist/` (83 archivos; siguen en disco, solo dejan de estar versionados). PR #98, commit `25c597a`. Issue cerrado automáticamente.

### #96 — `npm run lint` crasheaba por completo — ✅ RESUELTO
- `eslint.config.js` usaba `import` sin `"type":"module"` → `SyntaxError: Cannot use import statement outside a module` antes de analizar un solo archivo (reproducido antes de tocar nada).
- Fix: renombrado a `eslint.config.mjs`. Ya corriendo, salieron ~80 "errores" que eran ruido de configuración: la regla base `no-unused-vars` (no respeta `_req`/`_res`) duplicaba la de `@typescript-eslint`, y los `.js` sueltos no tenían globals de Node (`console`/`process`/`require`/`fetch` como `no-undef`). Se apagó la base para `.ts` y se agregó un bloque `**/*.js` con `globals.node`. PR #99, commit `3a9e2ba`.
- Quedaban 4 errores reales (`no-useless-escape` en el regex de símbolos especiales de contraseña, `user.model.ts`, dos ocurrencias). Se corrigieron en el PR #100 **después de comprobar carácter por carácter** que el regex nuevo acepta exactamente los mismos símbolos que el viejo (la validación de contraseñas no cambia).
- Resultado: `npm run lint` → **0 errores** (~830 warnings de formato de Prettier, deuda ya documentada y no bloqueante).

### CI con lint + build — ✅ HECHO (PR #100, commit `c13c89f`)
- `.github/workflows/test.yml` solo corría `npm run test:ci`; el ticket original del roadmap (#11, ya cerrado) pedía typecheck + lint + test. Ahora corre `lint`, `build` (tsc) y tests en cada push/PR. Workflow renombrado de "Run Tests" a "CI". Verificado: el CI pasó en verde en GitHub Actions antes de mergear.

### Suite `test:db` contra MySQL real + fix de zona horaria — ✅ HECHO (PR #101, commit `546e7c6`)
- **Por qué**: `npm test` corre con `DB_ENABLED` apagado (fallback en memoria), así que el código que llama de verdad a MySQL casi no tenía cobertura (`ingresos.repository.ts` 3%, `inversiones.repository.ts` 7%, `auth.repository.ts` 6.5%; cobertura total 46%). Toda la evidencia de que funcionaba con MySQL real eran pruebas manuales con `curl` (no repetibles).
- **Qué**: `jest.db.config.js` + `__tests__/tests/db/` (helpers, `env.setup.js` y 5 archivos, **21 tests**) que pasan por la capa HTTP (supertest) con `DB_ENABLED=true` contra una base real efímera. Cubren las regresiones históricas: #84 (crear y releer, persistencia real), #75 (UNION ALL / fila de `COUNT(*)`), #82 (`es_por_defecto`), #89 (403 sin scope) y #91 (fechas-corte → dashboard/balance). `jest.config.js` excluye `__tests__/tests/db/` de la suite normal.
- **CI**: nuevo job `test-db` con un **contenedor de servicio MySQL efímero** (se crea y destruye con el job; nunca toca Railway). Verificado en GitHub Actions: ambos jobs en verde.
- **Bug real encontrado al escribirla (no un gap de cobertura)**: al crear un ingreso con `2026-01-15T00:00:00Z` y leerlo de vuelta, salía `2026-01-15T06:00:00Z`. Root cause: el pool de `mysql2` usaba `dateStrings: true`, así que los `DATETIME` salían como texto sin zona (`"2026-01-15 00:00:00"`) y cualquier cliente que hiciera `new Date(valor)` lo interpretaba como hora **local** (en Chihuahua/CDMX, UTC-6 → +6h). Era exactamente el "corrimiento de ~6h" anotado antes como sospecha sin confirmar.
- **Fix**: `src/config/db.ts` cambia `dateStrings: true` por `timezone: "Z"`; mysql2 devuelve `Date` interpretados como UTC y `res.json()` los serializa con `.toISOString()`. Sin cambios en repositorios/DTOs. **Verificado en vivo contra Railway** tras el deploy: se mandó `2026-01-15T00:00:00Z` y se leyó `2026-01-15T00:00:00.000Z` (registro de prueba borrado al final).

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

**Posteriores al #91** (esta parte sí sale de `git diff --stat 1302f0e HEAD`, no de memoria):

| Archivo | Qué cambió |
|---|---|
| `scripts/seed-transaccional.js`, `package.json` (`seed:transaccional`) | **Nuevo** — seed vía API real (#65) |
| `db/moneywise_schema.sql` | Seed global de `destinos` ampliado de 4 a 10 (#65) |
| `src/dtos/`, `repositories/`, `services/`, `controllers/`, `routes/fechasCorte.*` (5 archivos) | **Nuevos** — módulo de fechas de corte (#91) |
| `src/app.ts`, `src/middlewares/auth.middleware.ts` | Mount `/api/v1/ahorro`; scopes `ahorro:leer/escribir` por defecto en `mockAuth` (#91) |
| `src/services/dashboard.service.ts` | Fix del mapeo de columnas de `balance()` (#91/#95) |
| `__tests__/tests/unit/fechasCorte-db.test.ts`, `dashboard-balance.test.ts`; `integration/fechasCorte.test.ts` | **Nuevos** (#91) |
| `eslint.config.js` → `eslint.config.mjs` | Renombrado + reglas/globals corregidos (#96) |
| `dist/` (83 archivos) | Destrackeado de git (#97) |
| `src/models/user.model.ts` | Regex de símbolos de contraseña sin escapes inútiles, mismo comportamiento (#100) |
| `.github/workflows/test.yml` | Jobs `test` (lint+build+test) y `test-db` (MySQL efímero) (#100/#101) |
| `src/config/db.ts` | `dateStrings: true` → `timezone: "Z"` (fix de zona horaria, #101) |
| `jest.db.config.js`, `jest.config.js`, `package.json` (`test:db`), `__tests__/tests/db/*` (7 archivos) | **Nueva** suite contra MySQL real (#101) |

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
| `GET/POST/PATCH/DELETE /api/v1/metas` | ✅ PROBADO EN VIVO | CRUD completo, `ahorro_real`/`eliminado_en` confirmados por `SELECT` directo. Auth (`mockAuth`/`requireScope`) agregada y verificada en vivo el mismo día (#89, PR #92): 403 sin scope, 201/200 con scope, ownership de `DELETE` preservado |
| `GET /api/v1/dashboard/resumen` | ✅ PROBADO EN VIVO | Reflejó totales reales (ingresos/egresos/balance) |
| `GET /api/v1/dashboard/metas-vs-ahorro` | ✅ PROBADO EN VIVO | 200, respuesta correcta (vacía porque no había metas activas en ese momento) |
| `GET /api/v1/dashboard/balance` | ✅ PROBADO EN VIVO | Resuelto (#91, PR #94/#95): `POST /ahorro/fechas-corte` para alimentarla + fix de un bug de mapeo de columnas que hacía que diera 0. Confirmado con valores reales (`ingresosAcumulados: 173493.66`, etc.) |
| `GET/POST/DELETE /api/v1/ahorro/fechas-corte` | ✅ PROBADO EN VIVO | CRUD (sin PATCH, no aplica) + 403 sin scope + 409 duplicado (#91) |
| `GET/POST/PUT/DELETE /api/v1/catalogos/destinos` | ✅ PROBADO EN VIVO | CRUD completo + duplicado (400) + bloqueo de default |
| `GET/POST/PUT/DELETE /api/v1/catalogos/procedencias` | ✅ PROBADO EN VIVO | CRUD completo |
| `GET/POST/PUT/DELETE /api/v1/catalogos/tipos-egreso` | ✅ PROBADO EN VIVO | CRUD completo |
| `GET/POST/PUT/DELETE /api/v1/catalogos/tipos-ingreso` | ✅ PROBADO EN VIVO | CRUD completo incluyendo 409 duplicado y 404 doble delete |
| `GET /api/v1/catalogos/frecuencias` | ✅ PROBADO EN VIVO | Lectura libre confirmada |
| `POST/PUT/DELETE /api/v1/catalogos/frecuencias` | ✅ PROBADO EN VIVO | Confirmado el bloqueo 403 sin `admin:catalogos` |
| `GET/PUT/PATCH /api/users/:id` | ⚠️ Comportamiento esperado, no es un bug | Módulo legacy en memoria, separado de `auth`. Sin endpoint de creación (ver sección 6). 404 porque el Map está vacío |
| `GET /api/v1/version`, `GET /health` | ✅ PROBADO EN VIVO (implícito) | Usados repetidamente como sanity check durante toda la sesión |

**Nota sobre encoding**: el mensaje de error "Token de restablecimiento inválido" sale como "invÃ¡lido" (problema de encoding/mojibake). Cosmético, no investigado a fondo, bajo prioridad.

**Nota sobre timezone — RESUELTA** (PR #101): el corrimiento de ~6h era que las fechas salían de la API sin marca de zona (`dateStrings: true`) y los clientes en UTC-6 las leían como hora local. Ahora salen como ISO-8601 con `Z` (`timezone: "Z"` en `src/config/db.ts`). Verificado en vivo: se mandó `2026-01-15T00:00:00Z` y se leyó `2026-01-15T00:00:00.000Z`. Ojo: los registros que ya existían en Railway no cambian en la base (siempre se guardaron bien, en UTC); solo cambió cómo se leen.

### Cobertura automatizada contra MySQL real (`npm run test:db`, 21 tests)

Las pruebas "en vivo" de la tabla de arriba se hicieron a mano con `curl` (no se repiten solas). Desde el PR #101 una parte quedó **automatizada** contra una base MySQL real, en local (Docker) y en CI:

| Cubierto por `test:db` | Sigue verificado solo a mano |
|---|---|
| Auth: registro, login correcto/incorrecto, correo duplicado | Auth: `olvido` / `restablecer` |
| Ingresos: crear + releer (fecha exacta), listar con paginación, eliminar + 404 | Ingresos: `PATCH` |
| Egresos: crear + releer, `PATCH` + releer | Egresos: `DELETE`, listado con filtros |
| Inversiones: crear + releer | Inversiones: listar, `PATCH`, `DELETE` |
| Catálogos: destinos/procedencias/tipos-egreso (crear, editar, borrar, duplicado, paginación), frecuencias (lectura libre + 403 escritura) | Catálogos: `tipos-ingreso` |
| Metas: 403 sin scope, crear/leer/actualizar con avance real, `DELETE` con dueño correcto e incorrecto | Metas: listado con filtros |
| Dashboard: `balance` (404 sin fecha de corte, luego montos reales), `resumen`; fechas-corte: crear y duplicado (409) | Dashboard: `metas-vs-ahorro`; fechas-corte: listar y `DELETE` |

---

## 4. Decisiones tomadas y por qué

1. **`frecuencias` es global, no per-usuario** (#68) — es un enum de calendario cerrado (Diario, Semanal...), no algo que un usuario personalice como sus destinos. Escritura restringida a `admin:catalogos`.
2. **Rotar credenciales en vez de solo limpiar el README** (#79) — un repo público ya expuesto se asume visto/indexado; borrar el valor del archivo actual no revierte nada retroactivo.
3. **`tipos-ingreso` se rediseñó completo en vez de parchear** (#77) — el DTO no coincidía con la tabla real (tenía columnas que nunca existieron); no había forma de "conectar" sin antes arreglar el modelo.
4. **`metas` preservó su interfaz pública al conectar a SPs** (#87) — para no tocar `metas.service.ts`/`metas.controller.ts` más de lo estrictamente necesario y no romper los 25 tests de integración existentes que ya pasaban.
5. **Auth de `metas` (#89) se dejó fuera de #87 a propósito** — para no mezclar un cambio de auth con uno de persistencia en el mismo PR. Quedó pendiente (ver advertencia arriba: el issue se cerró sin el fix).
6. **`update()` de metas no valida dueño** (comportamiento preexistente, se mantuvo) — el service nunca lo validó ahí (solo en `delete`); cambiar eso hubiera sido ensanchar el alcance de #87 hacia el problema de auth que le corresponde a #89.
7. **`dashboard/balance` (#91) se dejó documentado (no implementado) en la sesión del #65** porque hubiera significado construir un módulo CRUD completo nuevo (`fechasCorte.*`), fuera del alcance de "verificar antes de #65" — se implementó después, en la sesión siguiente (ver sección 1).
8. **`fechasCorte` en `/api/v1/ahorro/fechas-corte` con `usuarioId` tomado de `res.locals.auth`** (#91) — la ruta y los scopes (`ahorro:*`) son los del ticket original (`tickets/API_fechas_corte.md`); derivar el usuario del contexto de auth (como ingresos/egresos/inversiones) evita repetir el defecto de `metas`, donde el cliente manda su propio `usuarioId`.
9. **Fix de zona horaria en un solo lugar (`timezone: "Z"` en el pool) en vez de parchear cada repositorio** (#101) — la causa era el formato de lectura de todo el pool; arreglarlo ahí corrige todos los módulos a la vez, sin tocar DTOs, y la escritura (`toMySQLDateTime` produce strings) no se ve afectada. No volver a `dateStrings: true` sin reponer una conversión explícita a ISO.
10. **`test:db` pasa por la capa HTTP (supertest), no llama repositorios directamente** (#101) — ejercita rutas → controllers → services → repositorios → SPs reales, que es lo que se había probado a mano con `curl`, y no depende de conocer las firmas internas de cada repo.
11. **CI de `test:db` con un contenedor de servicio efímero, nunca contra Railway** (#101) — los tests crean usuarios y movimientos reales; correrlos contra producción la contaminaría y obligaría a guardar credenciales reales en CI. Nota práctica: `scripts/import-db.js` lee `DB_PASS`, pero el runtime (`src/config/db.ts`) lee `DB_PASSWORD` — son variables distintas, documentado en `CLAUDE.md`.
12. **ESLint: renombrar a `.mjs` en vez de poner `"type":"module"` global** (#96) — un `type: module` a nivel de proyecto hubiera roto los scripts CommonJS existentes (`jest.config.js`, `scripts/*.js`). El regex de contraseña se corrigió solo después de demostrar equivalencia carácter por carácter, porque cambiar una validación de contraseñas "a ojo" es riesgoso.

---

## 5. Bugs / deuda técnica encontrada, pendiente

| Item | Estado | Detalle |
|---|---|---|
| #89 — metas sin auth | **Resuelto** (PR #92, verificado en vivo) | Auth agregada; queda pendiente (no bloqueante, era opcional) cerrar el gap de ownership en `PATCH` y dejar de confiar en el `usuarioId` del body |
| #91 — dashboard/balance función muerta | **Resuelto** (PRs #94/#95, verificado en vivo) | Módulo `fechasCorte.*` agregado + bug de mapeo de columnas corregido |
| `dist/` trackeado en git pese a `.gitignore` | **Resuelto** (#97, PR #98) | Destrackeado con `git rm -r --cached dist/` |
| `npm run lint` roto | **Resuelto** (#96, PRs #99/#100) | 0 errores; ya conectado al CI |
| Corrimiento de ~6h en fechas leídas | **Resuelto** (PR #101) | `dateStrings: true` → `timezone: "Z"`; verificado en vivo |
| Encoding roto en mensajes de error | **Sigue abierto, sin issue** | "Correo o contraseÃ±a incorrectos", "invÃ¡lido": mojibake en mensajes del backend (visto en login y `restablecer`, también en los logs de `test:db`). Cosmético, no investigado a fondo |
| ~830 warnings de Prettier | Sigue abierto, sin issue | Solo formato; no rompe lint ni CI (los warnings no fallan `eslint`) |
| Cobertura de `npm test` = ~46% | Por diseño, no es un déficit a perseguir | El código que llama a MySQL solo corre con `DB_ENABLED=true`; eso lo cubre `test:db` (21 tests). Lo que `test:db` NO cubre está listado en la sección 3 |
| Ownership débil en varios módulos | Sigue abierto (decisión consciente) | `POST`/`GET`/`DELETE` de `metas` confían en el `usuarioId` del body y `PATCH` no valida dueño; en general `mockAuth` es auth simulada por headers (sin JWT real ligado a scopes/ownership). Ver `CLAUDE.md` → "Problemas Conocidos" |
| `/api/users/*` (legacy) sigue en memoria, sin endpoint de creación | Documentado, no es un bug nuevo | Ya estaba así antes de esta sesión (ver CLAUDE.md histórico); no hay forma de poblarlo vía API |
| `db/stored-procedures/sp_usuarios.sql` | No investigado | Archivo separado de `db/moneywise_schema.sql` (la fuente de verdad desde #67) — posible contenido duplicado/obsoleto, no se revisó en esta sesión |
| Issue #63 "Documentación" (PDF ITCHII/TecNM) | Abierto — lo lleva el usuario | No es código: entregable académico con varias personas asignadas |
| Issue #1 "other issue" (cuerpo: "dashboarrd") | Abierto, parece vacío/basura | Pendiente de que el usuario decida si se cierra |

---

## 6. Qué falta antes de pasar al #65

**#65 ya se hizo** (ver sección 1) — esta sección queda como referencia histórica. #89, #65 y #91 resueltos y verificados en vivo.

---

## 7. Siguiente paso exacto para retomar en sesión nueva

1. Leer este archivo (`tickets/ESTADO_SESION.md`) y `CLAUDE.md` completos antes de tocar código.
2. **Fase 1 (esta API) cerrada.** No hay PRs pendientes ni ramas de trabajo sueltas. #67, #68, #71, #73, #75, #77, #79, #80, #82, #84, #87, #89, #65, #91, #96 y #97 están cerrados con su fix real adentro (verificado, no solo cerrados de nombre — ver sección 1). `main` en sincronía con GitHub; último commit de código: `546e7c6` (PR #101); después solo commits de documentación. CI en verde (jobs `test` y `test-db`).
3. Issues abiertos hoy: **#63** (documentación/PDF — lo lleva el usuario, no es código) y **#1** (vacío, pendiente de decidir si se cierra). Nada más.
4. Datos de #65 ya sembrados en Railway (5 usuarios `*.seed@moneywise.test`, password `SeedMW2026!`); `npm run seed:transaccional` es seguro de re-correr (idempotente a nivel usuario+recurso).
5. Verificar `git status` (limpio, en `main`) y correr `npm test`, `npm run lint`, `npm run build`. Para `npm run test:db` hace falta un MySQL de pruebas (ver `CLAUDE.md` → "Pruebas contra MySQL real").

### Fase 2 — `dodamivid/MoneyWise-DataLake` (NO iniciada; la arranca el usuario cuando lo indique)

**Regla de proceso (corrección explícita del usuario):** "ya podemos empezar con la segunda fase" fue una *pregunta* ("¿estamos listos?"), no una instrucción. En la sesión se clonó el repo, se creó una rama local y se escribió un `docker-compose.yml` de borrador **sin que se pidiera**; el usuario lo frenó y se borró todo (clon e imágenes de Docker descargadas). **No clonar ni escribir nada en el repo del DataLake hasta que el usuario diga "empezamos".**

Lo que se observó (solo lectura, vía `gh`) — el repo es **solo un esqueleto**, sin código:
- README con la arquitectura objetivo: MySQL (binlog ROW) → Debezium (Kafka Connect) → Kafka + Zookeeper → Spark Structured Streaming en capas Bronze → Silver → Gold (Parquet local) → detección de anomalías (z-score/IQR) → orquestación con Airflow → GCP Cloud Storage → dashboard de BI (Power BI/Metabase). Declara como fuente "schema adaptado de MoneyWise-Integracion".
- `.env.example` completo, `.gitignore` razonable (excluye `.env`, `data/*`, credenciales de GCP), carpetas vacías con `.gitkeep`, y **13 issues abiertos** que son el roadmap: #1 docker-compose base, #2 fuente MySQL con datos reales, #3 conector Debezium, #4 script de verificación de eventos, #5–#7 jobs Spark Bronze/Silver/Gold, #8 anomalías, #9 Airflow, #10 salida a GCP, #11 documentación, #12 tests de calidad de datos, #13 dashboard de BI. La cadena natural de arranque es #1 → #2 → #3 → #4 (base del CDC) antes de meter Spark.

Entorno del usuario (observado esta sesión): Docker 28 con Compose v2 y ~12 GB de RAM asignados (12 CPUs), Python 3.14 (por defecto) y 3.11 instalados, Java 21. **El puerto 3306 del host ya lo ocupa otro contenedor del usuario** (`proyecto-php-sql-db-1`, no tocar) → el MySQL del DataLake tiene que publicarse en otro puerto (p. ej. 3308). Hay wheels de `confluent-kafka` para Windows en Python 3.14 y 3.11. Se comprobó que las imágenes `mysql:8.0`, `confluentinc/cp-zookeeper:7.5.3`, `confluentinc/cp-kafka:7.5.3` y `quay.io/debezium/connect:2.7.3.Final` existen y se pueden descargar. **[Inferencia, no verificada]** PySpark probablemente no soporte todavía Python 3.14 → conviene correr Spark en Docker o con 3.11.

Qué implica lo hecho en la fase 1 para el DataLake (para no redescubrirlo):
- **Los borrados de la API son lógicos** (`eliminado_en`), así que el CDC los ve como `UPDATE`, no como `DELETE`; la capa Silver debe filtrar `eliminado_en IS NULL`.
- **Datos sensibles que no deben entrar al lake**: los hashes de contraseña de `usuarios` y la tabla `auth_tokens` (tokens de recuperación). Excluirlos desde el conector (`table.exclude.list` / `column.exclude.list`) es lo natural.
- **Las fechas son UTC** (`DATETIME` guardado como UTC; tras el #101 la API también las lee como UTC). Relevante para particionar Bronze/Silver por fecha.
- **Fuente de datos de prueba**: el esquema canónico es `db/moneywise_schema.sql` (única fuente de verdad) y `npm run seed:transaccional` genera ~1,800 movimientos realistas, pero lo hace **vía la API**; para alimentar un MySQL propio del DataLake habría que levantar la API local contra ese MySQL (`test:db` demuestra que la API corre contra un MySQL local en Docker). *Sugerencia de diseño, no verificada:* montos `DECIMAL` con `decimal.handling.mode=string` en Debezium para no perder exactitud en dinero.
