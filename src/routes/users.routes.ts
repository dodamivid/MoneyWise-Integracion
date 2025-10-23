import express, { Request, Response } from 'express';
import { z } from 'zod';

const router = express.Router();

// 🔹 Esquema de validación con Zod
const userSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type UserInput = z.infer<typeof userSchema>;

// 🔹 POST /api/users
router.post('/', (req: Request, res: Response) => {
  const validation = userSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: validation.error.format(),
    });
  }

  const newUser: UserInput = validation.data;

  // Simulación de creación (puedes reemplazar por DB más adelante)
  const createdUser = {
    id: Math.floor(Math.random() * 1000),
    ...newUser,
    createdAt: new Date().toISOString(),
  };

  return res.status(201).json(createdUser);
});

export default router;
