import pino from "pino";

/**
 * Configura el logger Pino con formato legible o JSON según el entorno.
 * Evita usar "pino-pretty" en modo test (Jest) y producción.
 *
 * Entornos:
 * - development → logs colorizados y legibles
 * - production  → logs JSON para monitorización
 * - test/CI     → sin transporte ni salida en consola
 */

const isTestEnv = process.env.NODE_ENV === "test";
const isDevEnv = process.env.NODE_ENV === "development";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  // Solo usa pino-pretty en desarrollo (no en test ni producción)
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
