import pinoHttp from "pino-http";
import logger from "../utils/logger";

/**
 * Middleware que registra automáticamente cada request HTTP.
 * 
 * Incluye método, ruta, código de estado, tiempo de respuesta y correlation-id.
 * Usa la instancia global de Pino configurada en utils/logger.ts.
 * 
 * En entorno de test (NODE_ENV=test), no genera logs para evitar ruido en Jest.
 */
const httpLogger = pinoHttp({
  logger,
  customProps: (req) => ({
    correlationId: req.headers["x-correlation-id"],
  }),
  // Desactiva logs en entorno de prueba
  autoLogging: process.env.NODE_ENV !== "test",
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        correlationId: req.headers["x-correlation-id"],
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

export default httpLogger;
