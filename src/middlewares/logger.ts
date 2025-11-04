import pinoHttp from "pino-http";  // Conecta Pino con Express
import logger from "../utils/logger";

/**
 * Middleware que registra automáticamente cada request HTTP.
 * Incluye método, ruta, código de estado y tiempo de respuesta.
 */
export const httpLogger = pinoHttp({
  logger, // Usa el logger definido previamente
  customProps: (req) => ({
    // Agrega información adicional a cada log
    correlationId: req.headers["x-correlation-id"], // Añade el ID de correlación a cada registro
  }),
});
