// src/dtos/inversiones.dto.ts
import { z } from "zod";

// Esquema de validación para crear/actualizar inversión
export const InversionDTO = z.object({
  usuarioIdusuarioId: z.number().int({ message: "El usuarioId es obligatorio" }),
  monto: z.number().positive("El monto debe ser positivo"),
  plazoMeses: z.number().min(1, "El plazo debe ser mínimo de 1 mes"),
  tipo: z.string().min(1, "El tipo de inversión es obligatorio"),
  fechaInicio: z.string().datetime("Formato de fecha inválido"),
});

export type Inversion = z.infer<typeof InversionDTO>;
