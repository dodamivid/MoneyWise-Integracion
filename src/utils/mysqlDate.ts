/**
 * Convierte una fecha ISO-8601 (la que valida Zod y manda el cliente, ej.
 * "2026-01-01T00:00:00Z" o "2026-01-01T00:00:00.000Z") al formato que MySQL
 * espera para columnas DATETIME/DATE: "YYYY-MM-DD HH:MM:SS".
 *
 * Bug real encontrado en revisión post-#71: los repos pasaban las fechas ISO
 * tal cual a los stored procedures. MySQL las rechaza ("Incorrect datetime
 * value: '2026-01-01T00:00:00Z' for column 'pFechaInicio'") — la creación de
 * ingresos/egresos/inversiones fallaba silenciosamente y cada repo caía a un
 * fallback en memoria/ID inventado que aparentaba éxito (`201`) sin haber
 * guardado nada real (ver issue #84).
 *
 * @param value Fecha ISO-8601, `null` o `undefined`.
 * @returns Fecha en formato MySQL, o `null` si la entrada era `null`/`undefined`.
 */
export function toMySQLDateTime(
  value: string | null | undefined
): string | null {
  if (value === null || value === undefined || value === "") return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    // Si no es una fecha parseable, se deja pasar tal cual para que la
    // validación de MySQL/el SP la rechace con su propio mensaje.
    return value;
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
}
