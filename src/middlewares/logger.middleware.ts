//logger.middleware.ts
import pino from "pino";
import pinoHttp from "pino-http";

// Detecta entorno para decidir transporte
const isJest = process.env.JEST_WORKER_ID !== undefined;
const isProd = (process.env.NODE_ENV || "").toLowerCase() === "production";
const enablePretty = !isProd && !isJest;

const logger = pino(
  enablePretty
    ? {
        level: process.env.LOG_LEVEL || "info",
        transport: {
          // Solo en local/dev; en Render (prod) evitamos pino-pretty
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {
        level: process.env.LOG_LEVEL || "info",
      }
);

const httpLogger = pinoHttp({
  logger,
  customProps: (req: any, res: any) => ({
    correlationId: (req as any).correlationId,
  }),
});

export default httpLogger;
