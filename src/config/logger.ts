import pino, { Logger, LoggerOptions } from "pino";

const env = process.env.NODE_ENV || "development";
const isTest = env === "test";
const isDev = env !== "production";
const isCI = process.env.CI === "true";
const prettyEnv = process.env.LOG_PRETTY;

const logLevel = process.env.LOG_LEVEL || (isDev ? "debug" : "info");
const shouldPrettyPrint =
  prettyEnv === "true" ||
  (prettyEnv !== "false" && isDev && !isCI && !isTest);

const options: LoggerOptions = {
  level: logLevel,
  base: {
    service: process.env.LOG_SERVICE_NAME || "moneywise-api",
    env,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

if (shouldPrettyPrint) {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  };
}

if (isTest && process.env.LOG_ENABLED !== "true") {
  options.enabled = false;
}

export const logger = pino(options);

export function getLoggerWithTraceId(traceId?: string): Logger {
  return traceId ? logger.child({ traceId }) : logger;
}
