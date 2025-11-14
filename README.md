# MoneyWise

Repositorio del equipo de Integración (endpoints) – Node.js + TypeScript + Express.

## API (dev quickstart)

- Server local: `http://localhost:3000`
- Health: `GET /health`
- Users: `POST /api/users`, `GET /api/users/{id}`
- Egresos (CRUD): base `/api/v1/egresos`
  - `GET /api/v1/egresos` - Lista con filtros y paginación
  - `POST /api/v1/egresos` - Crea egreso
  - `GET /api/v1/egresos/:id` - Obtiene egreso
  - `PATCH /api/v1/egresos/:id` - Actualiza egreso
  - `DELETE /api/v1/egresos/:id` - Elimina egreso

Auth (simulada en dev):
- Por defecto, en desarrollo se inyectan scopes `egresos:leer,egresos:escribir,admin:egresos`, por lo que puedes probar en Postman sin headers.
- Para simular permisos/403, usa headers opcionales:
  - `x-mw-user`: ID de usuario (numérico)
  - `x-mw-scopes`: scopes separados por coma (ej. `egresos:leer,egresos:escribir`)
- También puedes controlar el default con la variable de entorno `MOCK_DEFAULT_SCOPES`.

## Qué entregaremos para la tarea
- Repositorio en GitHub (este).
- Un Proyecto de GitHub vinculado al repo.
- 10 issues en el backlog del Proyecto.
- Roadmap inicial para esos 10 tickets: `docs/roadmap.md`.
- Profesor agregado como colaborador: `cesaenzd`.

## 1) Crear el Proyecto de GitHub (Project)
1. En GitHub > pestaña "Projects" > "New project" > "Board".
2. Nombre: "MoneyWise – Integración". Marcar **Link to a repository** y seleccionar este repo.
3. Columnas sugeridas: Backlog, In progress, In review, Done.
4. Filtro por etiqueta recomendado: `integration`.

## 2) Crear los 10 issues automáticamente
Hice un workflow para sembrar los issues del backlog.

Pasos:
1. Ir a la pestaña "Actions" en el repo.
2. Elegir el workflow "Seed Backlog Issues (Integration)".
3. Click en "Run workflow" > Run. Espera ~10s.
4. Verás los 10 issues creados con labels: `integration`, `backend`, `ts`, `express`, `backlog`.
5. En tu Project, usa "Add item" > "Repository" para importar todos los issues.

Los títulos/tareas están alineados con el roadmap en `docs/roadmap.md`.

## 3) Roadmap
Revisa `docs/roadmap.md` para ver el orden y criterios de aceptación.

## 4) Agregar al profesor como colaborador
1. Settings > Collaborators > Add people.
2. Usuario: `cesaenzd`.
3. Rol: `Triage` o `Write` según lo que pida.

## 5) Automatizar que los issues se agreguen al Project (opcional recomendado)
Para que cada nuevo issue con label `integration` entre solo al tablero:

A) Crear un token personal (PAT)
- En GitHub (tu cuenta) > Settings > Developer settings > Personal access tokens > Fine-grained tokens.
- Repository access: sólo este repo.
- Permissions: Repository: Issues (Read), Contents (Read). Organization permissions: Projects (Read & Write) — si tu Project es de usuario, otorga Projects (Read & Write) a tu usuario; si es de una organización, a la org.
- Copia el token.

B) Guardar el token como secret del repo
- Repo > Settings > Secrets and variables > Actions > New repository secret
- Name: `PROJECT_PAT`
- Value: pega el token.

C) Ejecutar el workflow
- Actions > "Add issues to Project (Integration)".
- Si lo corres manual (Run workflow), pasa estos inputs:
  - owner: tu usuario de GitHub (por ejemplo `dodamivid`).
  - project_number: el número que aparece en la URL del Project (ej. users/<login>/projects/2 → 2).
  - label: `integration` (por defecto ya es esa).
- El workflow también se dispara cuando se crea o etiqueta un issue con `integration`.

## 6) Etiquetas sugeridas
- `integration`, `backend`, `ts`, `express`, `backlog`, `bug`, `feature`, `task`.

## 7) Issue templates
En `.github/ISSUE_TEMPLATE/` hay plantillas para bug, feature y task.

## 8) Próximos pasos técnicos (opcional)
- Inicializar monorepo o paquete `web` con Express en TypeScript.
- Añadir CI para typecheck/test.

## 9) Notas adicionales
- Asegúrate de tener los permisos necesarios en GitHub para realizar todas las acciones.
- Comunica cualquier duda o inconveniente al equipo.

## Estilo de código: ESLint + Prettier

Para mantener el código consistente entre Windows, macOS y Linux, este repo incluye configuración de ESLint (v9 flat config) y Prettier.

### Instalación (una vez)

Las dependencias ya están en `package.json`. Si no las tienes instaladas:

```powershell
npm install
```

### Scripts disponibles

- Verificar formato (no modifica archivos):
  ```powershell
  npm run format
  ```
- Aplicar formato con Prettier (modifica archivos):
  ```powershell
  npm run format:fix
  ```
- Ejecutar ESLint (verifica reglas y estilo):
  ```powershell
  npm run lint
  ```
- ESLint con autofix cuando sea posible:
  ```powershell
  npm run lint:fix
  ```

### Qué se ignora en el lint

La configuración de ESLint ignora directorios generados y no fuente:

- `dist/**`
- `coverage/**`
- `node_modules/**`
- `docs/**`

Esto evita reportes sobre artefactos compilados o documentación.

### Recomendado en VS Code

Instala las extensiones:
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)

Opcional en tu configuración de VS Code (`.vscode/settings.json` local):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["typescript"],
  "files.eol": "auto"
}
```

### Finales de línea (EOL)

Se incluye `.gitattributes` y `.editorconfig` para normalizar EOL:

- Regla general: `* text=auto` (Git adapta EOL por OS).
- Forzamos LF donde CRLF rompe herramientas (YAML, SQL, Dockerfile, scripts de shell).
- Scripts Windows (`.bat`, `.cmd`) mantienen CRLF.

Esto no afecta el runtime; sólo reduce diffs y errores de tooling.

### Flujo sugerido antes de PR

```powershell
npm run format:fix
npm run lint
npm test
```

Si el lint reporta variables sin uso y son intencionales, prefija el nombre con `_` (ej. `_unused`).

### Nota para liderazgo ("El gallo de oro")

- `npm run format:fix` ejecuta Prettier en modo escritura y re-formatea archivos de texto según `.prettierrc`. No cambia la lógica de la app, solo estilo (comillas, espacios, saltos de línea, etc.).
- Es opcional. No está forzado en pre-commit ni en CI. El equipo puede usarlo antes de un PR para mantener consistencia o decidir no usarlo.
- Si se usa y no gusta algún cambio, se puede revertir con Git (por archivo o en bloque) antes de hacer commit.
- Alcance: por defecto Prettier recorre el repo. Si se quiere limitar a código fuente, se puede añadir un `.prettierignore` con:
  - `dist/`, `coverage/`, `node_modules/`
- Si en el futuro se quiere hacerlo obligatorio, se puede añadir un job de CI que ejecute `npm run format` (modo check) y falle cuando haya archivos fuera de formato.

### Validación de no-regresión (para revisión rápida)

- Pruebas: 4 suites, 26 tests – PASS.
- TypeScript: `tsc --noEmit` – PASS.
- Lint: 18 errores y 565 warnings (principalmente estilo Prettier y variables no usadas). No afecta ejecución ni pruebas; se pueden abordar gradualmente cuando se decida.
- Sin cambios de lógica en módulos existentes (users/egresos/health); se agregó el módulo Dashboard y tooling opcional.

### Alcance de cambios incluidos en esta rama

- Nuevos (Dashboard): `src/controllers/dashboard.controller.ts`, `src/dtos/dashboard.dto.ts`, `src/repositories/dashboard.repository.ts`, `src/routes/dashboard.routes.ts`.
- Ajustes: `src/app.ts` (montaje Swagger y rutas), `docs/api/openapi.yaml` (sección Dashboard), `README.md` (esta nota).
- Tooling/documentación opcional: `.editorconfig`, `.gitattributes`, `.prettierrc`, `eslint.config.js`.

### Recomendaciones opcionales

- Añadir `.prettierignore` con `dist/`, `coverage/`, `node_modules/` si se desea limitar el alcance de `format:fix`.
- Prefijar con `_` variables no usadas que se mantengan por claridad (silencia el warning del linter).
- Ajustar `jest.config.js` para el entorno Node en el linter o migrarlo a `export default` (evita `no-undef` en lint), sin impacto en runtime o pruebas.
#   a p i - t i p o s - i n g r e s o  
 