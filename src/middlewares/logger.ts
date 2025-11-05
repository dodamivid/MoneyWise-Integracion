import pinoHttp from "pino-http";
import logger from "../utils/logger";

/**
 * Middleware que registra automáticamente cada request HTTP.
 * Incluye método, ruta, código de estado y tiempo de respuesta.
 */
const httpLogger = pinoHttp({
  logger,
  customProps: (req) => ({
    correlationId: req.headers["x-correlation-id"],
  }),
});

export default httpLogger;
