import pkg from "../../package.json";

/**
 * Obtiene la información de versión del backend
 */
export const getVersionInfo = () => {
  return {
    version: process.env.API_VERSION || pkg.version,
    build: process.env.BUILD_ID || "local",
    environment: process.env.NODE_ENV || "development",
    fecha: new Date().toISOString()
  };
};
