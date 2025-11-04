import pino from "pino";

/**
 * Configura un logger Pino con formato legible o JSON según el entorno.
 * Se evita usar "pino-pretty" en modo test, ya que Jest no soporta transportes.
 */
const isTestEnv = process.env.NODE_ENV === "test"; // entorno de test (Jest)
const isDevEnv = process.env.NODE_ENV !== "production" && !isTestEnv;

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Solo usa "pino-pretty" en desarrollo, no en test ni producción
  transport: isDevEnv
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export default logger;
