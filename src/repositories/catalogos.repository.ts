export const listarFrecuencias = async (buscar: string, pagina: number, tam: number, orden: string) => {
  // 🔸 Simulación de SP: CALL sp_frecuencias_listar(...)
  const data = [
    { frecuenciaId: 1, nombre: "Mensual", creadoEn: "2025-01-01", actualizadoEn: "2025-01-01" },
  ];
  return { data, meta: { paginacion: { pagina, tamanoPagina: tam, total: data.length } } };
};

export const crearFrecuencia = async (nombre: string) => {
  // 🔸 Simulación de SP: CALL sp_frecuencias_crear(pNombre)
  return { frecuenciaId: Math.floor(Math.random() * 1000), nombre };
};

export const actualizarFrecuencia = async (id: number, nombre: string) => {
  // 🔸 Simulación de SP: CALL sp_frecuencias_actualizar(...)
  return { actualizado: true };
};

export const eliminarFrecuencia = async (id: number) => {
  // 🔸 Simulación de SP: CALL sp_frecuencias_eliminar(...)
  return { eliminado: true };
};
