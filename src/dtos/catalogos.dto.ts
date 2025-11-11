export const validarFrecuenciaDTO = (nombre: string) => {
  if (!nombre || typeof nombre !== "string")
    throw { status: 422, message: "Nombre requerido" };
  if (nombre.length < 3 || nombre.length > 60)
    throw { status: 422, message: "El nombre debe tener entre 3 y 60 caracteres" };
};
