# Checklist de Endpoints y BD — MoneyWise

- Autenticación (`API_auth.md:1`): registro, login, recuperación y restablecimiento con políticas de contraseña, scopes iniciales y manejo de tokens. Listo para cubrir los requerimientos de “Autenticación” del módulo.
- Perfil de usuario (`API_usuarios.md:1`): obtención, actualización y cambio de contraseña con control de permisos (`usuarios:leer/escribir`). Cubre mantenimiento del perfil.
- Catálogos (`API_catalogo_destinos.md:1`, `API_catalogo_procedencias.md:1`, `API_catalogo_tipos_ingreso.md:1`, `API_catalogo_tipos_egreso.md:1`, `API_catalogo_frecuencias.md:1`): CRUD completo con seeds, validaciones y restricciones de administración, alineado al apartado “Movimientos financieros” del plan.
- Movimientos financieros (`API_ingresos.md:1`, `API_egresos.md:1`, `API_inversiones.md:1`): CRUD con filtros, paginación, validación de montos y scopes; integra catálogos y frecuencias. Soporta consultas por periodo, tipo, procedencia/destino.
- Ahorro y metas (`API_metas.md:1`, `API_fechas_corte.md:1`): metas con seguimiento de avance y fechas de corte para reportes fijos; incluye reglas de negocio y manejo de errores.
- Dashboard (`API_dashboard.md:1`): endpoints de resumen, balance y metas vs ahorro; documenta múltiples result sets y parámetros obligatorios para periodos/fecha de corte.
- Base de datos (`BD_ticket.md:1`): normalización del esquema, seeds globales, convención de `SIGNAL` y listado completo de SPs requeridos por cada API.
