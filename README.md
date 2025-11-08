# MoneyWise

Repositorio del equipo de Integración (endpoints) – Node.js + TypeScript + Express.

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