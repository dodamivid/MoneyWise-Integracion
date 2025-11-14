//logger.middleware.ts
import pino from "pino";
import pinoHttp from "pino-http";

// Detecta entorno de Jest (CI y pruebas locales)
const isJest = process.env.JEST_WORKER_ID !== undefined;

const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  // En JEST / CI → NO usar transport (pino-pretty truena)
  ...(isJest
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});

const httpLogger = pinoHttp({
  logger,
  customProps: (req: any, res: any) => ({
    correlationId: (req as any).correlationId,
  }),
});

export default httpLogger;
