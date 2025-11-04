import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware que genera o propaga un identificador único por cada petición.
 * Esto sirve para rastrear un request a través de múltiples servicios o logs.
 */
export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Si el cliente ya envió un ID (x-correlation-id), lo reutilizamos; si no, generamos uno nuevo
  const correlationId = req.headers["x-correlation-id"] || uuidv4();

  // Lo agregamos al header de la petición para que otros servicios también puedan leerlo
  req.headers["x-correlation-id"] = correlationId;

  // Añadimos el mismo header en la respuesta, útil para debugging del cliente
  res.setHeader("x-correlation-id", correlationId);

  // Continuamos con la siguiente función o ruta
  next();
};
