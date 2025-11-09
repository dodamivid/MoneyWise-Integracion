import { z } from "zod";

const ingresoSchema = z.object({
  usuarioId: z.number().optional(),
  tipoId: z.number(),
  procedenciaId: z.number().nullable().optional(),
  monto: z.number().positive("El monto debe ser positivo"),
  descripcion: z.string().max(255).optional(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime().optional()
});

export const validarIngresoDTO = (data: any, parcial = false) => {
  if (parcial) return ingresoSchema.partial().parse(data);
  return ingresoSchema.parse(data);
};
