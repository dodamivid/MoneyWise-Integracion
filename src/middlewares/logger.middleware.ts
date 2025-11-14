// NUEVO ARCHIVO: src/middlewares/logger.middleware.ts
import pino from "pino";
import pinoHttp from "pino-http";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const httpLogger = pinoHttp({
  logger,
  customProps: (req, res) => ({
    correlationId: (req as any).correlationId,
  }),
});

export default httpLogger;
