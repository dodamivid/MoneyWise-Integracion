/**
 * @fileoverview Definición del modelo de Meta con validación de esquema Zod.
 *
 * Este módulo define la estructura de la entidad Meta para la aplicación Money Wise.
 * Incluye reglas de validación completas usando esquemas Zod y definiciones de
 * tipos TypeScript para seguridad de tipos en tiempo de compilación.
 *
 * El modelo Meta representa una meta de ahorro creada por un usuario en la plataforma
 * Money Wise y contiene todos los campos necesarios para seguimiento de progreso,
 * montos objetivos y fechas de cumplimiento.
 *
 * @module models/meta.model
 * @category Models
 *
 * @example
 * ```typescript
 * import { MetaSchema, Meta, CreateMetaInput } from './models/meta.model';
 *
 * // Validar datos de meta
 * const metaData: CreateMetaInput = {
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   fechaFin: '2026-12-31T23:59:59Z',
 *   activa: true
 * };
 *
 * const validatedData = CreateMetaSchema.parse(metaData);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */

import { z } from "zod";

/**
 * Esquema Zod para validar datos de meta.
 *
 * Este esquema define las reglas de validación para todos los campos de meta:
 * - **metaId**: Identificador único autoincremental
 * - **usuarioId**: ID del usuario propietario de la meta
 * - **nombre**: Nombre descriptivo de la meta (máx. 120 caracteres)
 * - **montoObjetivo**: Cantidad objetivo a ahorrar (DECIMAL 12,2)
 * - **ahorroReal**: Cantidad ahorrada actualmente (DECIMAL 12,2)
 * - **porcentajeAvance**: Porcentaje de progreso calculado (0-100)
 * - **activa**: Bandera booleana que indica si la meta está activa
 * - **fechaInicio**: Fecha de inicio de la meta (ISO 8601)
 * - **fechaFin**: Fecha objetivo de cumplimiento (ISO 8601, opcional)
 * - **creadoEn**: Marca de tiempo de creación
 * - **actualizadoEn**: Marca de tiempo de última actualización
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Objeto de meta válido
 * const meta = MetaSchema.parse({
 *   metaId: 7,
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   ahorroReal: 35000.00,
 *   porcentajeAvance: 23.33,
 *   activa: true,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   fechaFin: '2026-12-31T23:59:59Z',
 *   creadoEn: '2025-01-05T10:45:00Z',
 *   actualizadoEn: '2025-04-01T08:10:00Z'
 * });
 * ```
 */
export const MetaSchema = z.object({
  /**
   * Identificador único para la meta.
   * Es un número entero autoincremental generado por el sistema.
   *
   * @example 7
   */
  metaId: z.number().int().positive({
    message: "El ID de meta debe ser un número entero positivo",
  }),

  /**
   * Identificador del usuario propietario de la meta.
   * Debe ser un número entero positivo que corresponda a un usuario existente.
   *
   * @example 23
   */
  usuarioId: z.number().int().positive({
    message: "El ID de usuario debe ser un número entero positivo",
  }),

  /**
   * Nombre descriptivo de la meta.
   * Debe tener entre 1 y 120 caracteres.
   * Los espacios al inicio y al final serán eliminados.
   *
   * @example 'Vacaciones 2026'
   */
  nombre: z
    .string({
      message: "El nombre de la meta es requerido",
    })
    .min(1, {
      message: "El nombre de la meta no puede estar vacío",
    })
    .max(120, {
      message: "El nombre de la meta no debe exceder 120 caracteres",
    })
    .trim(),

  /**
   * Monto objetivo a ahorrar.
   * Debe ser un número positivo mayor a 0.
   * Representa la cantidad total que se desea alcanzar.
   * Se almacena con precisión de 2 decimales (DECIMAL 12,2).
   *
   * @example 150000.00
   */
  montoObjetivo: z
    .number({
      message: "El monto objetivo es requerido",
    })
    .positive({
      message: "El monto objetivo debe ser mayor a 0",
    })
    .refine(
      (val) => {
        // Validar que tenga máximo 2 decimales
        const decimals = (val.toString().split('.')[1] || '').length;
        return decimals <= 2;
      },
      {
        message: "El monto objetivo debe tener máximo 2 decimales",
      }
    ),

  /**
   * Monto ahorrado actualmente.
   * Debe ser un número no negativo.
   * No puede ser mayor que el monto objetivo (validado en el servicio).
   * Se almacena con precisión de 2 decimales (DECIMAL 12,2).
   *
   * @default 0.00
   * @example 35000.00
   */
  ahorroReal: z
    .number({
      message: "El ahorro real debe ser un número",
    })
    .nonnegative({
      message: "El ahorro real no puede ser negativo",
    })
    .refine(
      (val) => {
        const decimals = (val.toString().split('.')[1] || '').length;
        return decimals <= 2;
      },
      {
        message: "El ahorro real debe tener máximo 2 decimales",
      }
    )
    .default(0.00),

  /**
   * Porcentaje de avance hacia la meta.
   * Se calcula automáticamente como (ahorroReal / montoObjetivo * 100).
   * Debe estar entre 0 y 100 (o más si se supera la meta).
   *
   * @example 23.33
   */
  porcentajeAvance: z
    .number({
      message: "El porcentaje de avance debe ser un número",
    })
    .nonnegative({
      message: "El porcentaje de avance no puede ser negativo",
    })
    .refine(
      (val) => {
        const decimals = (val.toString().split('.')[1] || '').length;
        return decimals <= 2;
      },
      {
        message: "El porcentaje de avance debe tener máximo 2 decimales",
      }
    ),

  /**
   * Bandera que indica si la meta está activa.
   * Las metas inactivas no se muestran en el dashboard principal.
   *
   * @default true
   */
  activa: z.boolean().default(true),

  /**
   * Fecha de inicio de la meta.
   * Se almacena como cadena de fecha ISO 8601 en UTC.
   *
   * @example '2025-01-01T00:00:00Z'
   */
  fechaInicio: z.string().datetime({
    message: "Formato de fecha y hora inválido para fechaInicio. Debe ser ISO 8601",
  }),

  /**
   * Fecha objetivo de cumplimiento de la meta.
   * Se almacena como cadena de fecha ISO 8601 en UTC.
   * Debe ser mayor o igual a fechaInicio (validado en el servicio).
   * Este campo es opcional.
   *
   * @example '2026-12-31T23:59:59Z'
   */
  fechaFin: z
    .string()
    .datetime({
      message: "Formato de fecha y hora inválido para fechaFin. Debe ser ISO 8601",
    })
    .optional(),

  /**
   * Marca de tiempo cuando se creó la meta.
   * Se almacena como cadena de fecha ISO 8601 en UTC.
   *
   * @example '2025-01-05T10:45:00Z'
   */
  creadoEn: z.string().datetime({
    message: "Formato de fecha y hora inválido para creadoEn",
  }),

  /**
   * Marca de tiempo cuando se actualizó la meta por última vez.
   * Se almacena como cadena de fecha ISO 8601 en UTC.
   *
   * @example '2025-04-01T08:10:00Z'
   */
  actualizadoEn: z.string().datetime({
    message: "Formato de fecha y hora inválido para actualizadoEn",
  }),
});

/**
 * Tipo TypeScript inferido del MetaSchema.
 *
 * Este tipo representa un objeto de meta completo con todos los campos.
 * Usa este tipo cuando trabajes con datos completos de meta.
 *
 * @typedef {Object} Meta
 * @property {number} metaId - Identificador único
 * @property {number} usuarioId - ID del usuario propietario
 * @property {string} nombre - Nombre de la meta
 * @property {number} montoObjetivo - Cantidad objetivo a ahorrar
 * @property {number} ahorroReal - Cantidad ahorrada actualmente
 * @property {number} porcentajeAvance - Porcentaje de progreso (0-100+)
 * @property {boolean} activa - Estado activo de la meta
 * @property {string} fechaInicio - Fecha de inicio (ISO 8601)
 * @property {string} [fechaFin] - Fecha objetivo (ISO 8601, opcional)
 * @property {string} creadoEn - Marca de tiempo de creación
 * @property {string} actualizadoEn - Marca de tiempo de última actualización
 *
 * @example
 * ```typescript
 * const meta: Meta = {
 *   metaId: 7,
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   ahorroReal: 35000.00,
 *   porcentajeAvance: 23.33,
 *   activa: true,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   fechaFin: '2026-12-31T23:59:59Z',
 *   creadoEn: '2025-01-05T10:45:00Z',
 *   actualizadoEn: '2025-04-01T08:10:00Z'
 * };
 * ```
 */
export type Meta = z.infer<typeof MetaSchema>;

/**
 * Esquema para crear una nueva meta.
 *
 * Este esquema omite campos generados por el sistema (metaId, ahorroReal,
 * porcentajeAvance, creadoEn, actualizadoEn) que serán asignados automáticamente
 * al crear una nueva meta.
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * const newMeta: CreateMetaInput = {
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   fechaFin: '2026-12-31T23:59:59Z',
 *   activa: true
 * };
 *
 * const validated = CreateMetaSchema.parse(newMeta);
 * ```
 */
export const CreateMetaSchema = MetaSchema.omit({
  metaId: true,
  ahorroReal: true,
  porcentajeAvance: true,
  creadoEn: true,
  actualizadoEn: true,
}).extend({
  // Validación adicional: si fechaFin existe, debe ser >= fechaInicio
}).refine(
  (data) => {
    if (!data.fechaFin) return true;
    return new Date(data.fechaFin) >= new Date(data.fechaInicio);
  },
  {
    message: "La fecha de fin debe ser mayor o igual a la fecha de inicio",
    path: ["fechaFin"],
  }
);

/**
 * Tipo TypeScript para entrada de creación de meta.
 *
 * Este tipo representa los datos necesarios para crear una nueva meta,
 * excluyendo campos generados por el sistema.
 *
 * @typedef {Object} CreateMetaInput
 * @property {number} usuarioId - ID del usuario propietario
 * @property {string} nombre - Nombre de la meta
 * @property {number} montoObjetivo - Cantidad objetivo a ahorrar
 * @property {string} fechaInicio - Fecha de inicio (ISO 8601)
 * @property {string} [fechaFin] - Fecha objetivo (ISO 8601, opcional)
 * @property {boolean} [activa] - Estado activo (opcional, por defecto true)
 *
 * @example
 * ```typescript
 * const createMetaData: CreateMetaInput = {
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   fechaFin: '2026-12-31T23:59:59Z',
 *   activa: true
 * };
 * ```
 */
export type CreateMetaInput = z.infer<typeof CreateMetaSchema>;

/**
 * Esquema para actualizar una meta existente.
 *
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 * Los campos del sistema (metaId, usuarioId, creadoEn) no pueden ser actualizados.
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Actualizar solo el nombre
 * const updateData: UpdateMetaInput = {
 *   nombre: 'Vacaciones Europa 2026'
 * };
 *
 * // Actualizar múltiples campos
 * const updateData: UpdateMetaInput = {
 *   montoObjetivo: 200000.00,
 *   ahorroReal: 50000.00,
 *   activa: true
 * };
 * ```
 */
export const UpdateMetaSchema = MetaSchema.omit({
  metaId: true,
  usuarioId: true,
  porcentajeAvance: true,
  creadoEn: true,
})
  .partial()
  .refine(
    (data) => {
      // Validar que ahorroReal no supere montoObjetivo si ambos están presentes
      if (data.ahorroReal !== undefined && data.montoObjetivo !== undefined) {
        return data.ahorroReal <= data.montoObjetivo;
      }
      return true;
    },
    {
      message: "El ahorro real no puede superar el monto objetivo",
      path: ["ahorroReal"],
    }
  )
  .refine(
    (data) => {
      // Validar que fechaFin >= fechaInicio si ambas están presentes
      if (data.fechaFin && data.fechaInicio) {
        return new Date(data.fechaFin) >= new Date(data.fechaInicio);
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser mayor o igual a la fecha de inicio",
      path: ["fechaFin"],
    }
  );

/**
 * Tipo TypeScript para entrada de actualización de meta.
 *
 * Todos los campos son opcionales, permitiendo actualizaciones parciales
 * de información de meta.
 *
 * @typedef {Object} UpdateMetaInput
 * @property {string} [nombre] - Nuevo nombre de la meta
 * @property {number} [montoObjetivo] - Nuevo monto objetivo
 * @property {number} [ahorroReal] - Nuevo ahorro acumulado
 * @property {boolean} [activa] - Nuevo estado activo
 * @property {string} [fechaInicio] - Nueva fecha de inicio
 * @property {string} [fechaFin] - Nueva fecha objetivo
 * @property {string} [actualizadoEn] - Marca de tiempo de actualización (establecida automáticamente)
 *
 * @example
 * ```typescript
 * const updateData: UpdateMetaInput = {
 *   nombre: 'Vacaciones Europa 2026',
 *   ahorroReal: 50000.00
 * };
 * ```
 */
export type UpdateMetaInput = z.infer<typeof UpdateMetaSchema>;

/**
 * Esquema para validación de ID de meta.
 *
 * Se usa para validar IDs de meta en parámetros de ruta.
 *
 * @constant
 * @type {z.ZodNumber}
 *
 * @example
 * ```typescript
 * const metaId = MetaIdSchema.parse(Number(req.params.id));
 * ```
 */
export const MetaIdSchema = z.number().int().positive({
  message: "Formato de ID de meta inválido. Debe ser un número entero positivo.",
});

/**
 * Tipo para IDs de meta validados.
 *
 * @typedef {number} MetaId
 *
 * @example
 * ```typescript
 * const metaId: MetaId = 7;
 * ```
 */
export type MetaId = z.infer<typeof MetaIdSchema>;

/**
 * Esquema para parámetros de consulta de listado de metas.
 *
 * Define los filtros y opciones de paginación disponibles para el endpoint GET /api/v1/metas.
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * const queryParams: MetaQueryParams = {
 *   usuarioId: 23,
 *   activa: true,
 *   pagina: 1,
 *   tamanoPagina: 20,
 *   orden: 'fechaInicio:desc'
 * };
 * ```
 */
export const MetaQueryParamsSchema = z.object({
  /**
   * ID del usuario para filtrar metas (solo admin puede usar este filtro).
   */
  usuarioId: z.number().int().positive().optional(),

  /**
   * Fecha de inicio del rango de búsqueda (ISO 8601).
   */
  desde: z.string().datetime().optional(),

  /**
   * Fecha de fin del rango de búsqueda (ISO 8601).
   */
  hasta: z.string().datetime().optional(),

  /**
   * Filtrar por estado activo/inactivo.
   */
  activa: z.boolean().optional(),

  /**
   * Número de página (base 1).
   */
  pagina: z.number().int().positive().default(1),

  /**
   * Tamaño de página (máximo 100).
   */
  tamanoPagina: z.number().int().positive().max(100).default(20),

  /**
   * Campo y dirección de ordenamiento.
   * Formato: 'campo' o 'campo:asc' o 'campo:desc'
   * Campos válidos: fechaInicio, fechaFin, creadoEn, montoObjetivo, porcentajeAvance
   */
  orden: z
    .string()
    .regex(/^(fechaInicio|fechaFin|creadoEn|montoObjetivo|porcentajeAvance)(:(asc|desc))?$/, {
      message:
        "Orden inválido. Use: fechaInicio|fechaFin|creadoEn|montoObjetivo|porcentajeAvance[:asc|:desc]",
    })
    .optional(),
});

/**
 * Tipo TypeScript para parámetros de consulta de metas.
 *
 * @typedef {Object} MetaQueryParams
 * @property {number} [usuarioId] - ID del usuario (solo admin)
 * @property {string} [desde] - Fecha de inicio del rango (ISO 8601)
 * @property {string} [hasta] - Fecha de fin del rango (ISO 8601)
 * @property {boolean} [activa] - Filtrar por estado activo
 * @property {number} [pagina] - Número de página (default 1)
 * @property {number} [tamanoPagina] - Tamaño de página (default 20, máx 100)
 * @property {string} [orden] - Campo y dirección de ordenamiento
 *
 * @example
 * ```typescript
 * const params: MetaQueryParams = {
 *   activa: true,
 *   pagina: 1,
 *   tamanoPagina: 20,
 *   orden: 'fechaInicio:desc'
 * };
 * ```
 */
export type MetaQueryParams = z.infer<typeof MetaQueryParamsSchema>;
