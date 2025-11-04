import pino from "pino";

//  Configura un logger Pino con formato legible o JSON según el entorno
const logger = pino({
  level: process.env.LOG_LEVEL || "info",  // Nivel mínimo de severidad a registrar (info, warn, error)
  transport: process.env.NODE_ENV !== "production"  // En modo desarrollo, muestra logs 
    ? {
        target: "pino-pretty",             // Formatea la salida para leerla fácilmente en consola
        options: {
          colorize: true,                  // Colores en la terminal
          translateTime: "SYS:standard"    // Muestra fecha/hora del sistema
        },
      }
    : undefined,                           // En producción, genera JSON puro (ideal para logs automáticos)
});

export default logger; // Exporta el logger para usarlo en cualquier módulo
