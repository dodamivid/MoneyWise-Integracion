import { z } from "zod";

export const CrearTipoIngresoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string().max(255, "La descripción no puede exceder 255 caracteres").optional(),
  activo: z.boolean().optional(),
});

export type CrearTipoIngresoDTO = z.infer<typeof CrearTipoIngresoSchema>;

export const ActualizarTipoIngresoSchema = CrearTipoIngresoSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Debe proporcionar al menos un campo para actualizar" }
);

export type ActualizarTipoIngresoDTO = z.infer<typeof ActualizarTipoIngresoSchema>;

export const ListarTiposIngresoSchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  tamanoPagina: z.coerce.number().int().positive().max(100).default(20),
  orden: z
    .string()
    .default("nombre:asc")
    .refine(
      (val) => /^(nombre|creadoEn)(:(asc|desc))?$/.test(val),
      { message: "Orden invalido" }
    ),
  activo: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (typeof val === "string") {
        if (val.toLowerCase() === "true") return true;
        if (val.toLowerCase() === "false") return false;
      }
      return val as boolean | undefined;
    }),
});

export type ListarTiposIngresoDTO = z.infer<typeof ListarTiposIngresoSchema>;
