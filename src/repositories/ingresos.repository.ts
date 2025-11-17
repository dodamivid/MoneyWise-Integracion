import { db } from "../config/db";
import type {
  ActualizarIngresoBody,
  CrearIngresoBody,
  IngresoDTO,
  ListarIngresosQuery,
} from "../dtos/ingresos.dto";

class IngresosRepository {
  private mapRow(row: any): IngresoDTO {
    return {
      ingresoId: row.ingresoId,
      usuarioId: row.usuarioId,
      tipoId: row.tipoId,
      procedenciaId: row.procedenciaId ?? null,
      monto: Number(row.monto),
      descripcion: row.descripcion ?? null,
      fechaInicio: row.fechaInicio,
      fechaFin: row.fechaFin ?? null,
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn,
    };
  }

  async listar(
    query: ListarIngresosQuery,
    usuarioIdResuelto: number
  ): Promise<{ ingresos: IngresoDTO[]; total: number }> {
    if (db.enabled && db.pool) {
      try {
        const {
          desde,
          hasta,
          tipoId,
          procedenciaId,
          min,
          max,
          pagina,
          tamanoPagina,
          orden,
        } = query;

        const resultSets = await db.call("sp_ingresos_listar", [
          usuarioIdResuelto,
          desde || null,
          hasta || null,
          tipoId || null,
          procedenciaId || null,
          min || null,
          max || null,
          pagina,
          tamanoPagina,
          orden,
        ]);

        const rows = (resultSets[0] as any[]) || [];

        let total = 0;
        let dataRows = rows;
        if (rows.length > 0) {
          const lastRow = rows[rows.length - 1];
          if (lastRow && lastRow.totalRegistros !== undefined) {
            total = Number(lastRow.totalRegistros) || 0;
            dataRows = rows.slice(0, -1);
          }
        }

        const secondSet = resultSets[1] as any[] | undefined;
        if (
          !total &&
          secondSet &&
          secondSet[0] &&
          secondSet[0].totalRegistros !== undefined
        ) {
          total = Number(secondSet[0].totalRegistros) || 0;
        }

        const ingresos = dataRows.map((row) => this.mapRow(row));
        return { ingresos, total };
      } catch (error) {
        console.error("Error en sp_ingresos_listar:", error);
      }
    }

    const mockIngresos: IngresoDTO[] = [
      {
        ingresoId: 101,
        usuarioId: usuarioIdResuelto,
        tipoId: 2,
        procedenciaId: 5,
        monto: 18500,
        descripcion: "Sueldo abril",
        fechaInicio: "2025-04-01T00:00:00Z",
        fechaFin: "2025-04-30T23:59:59Z",
        creadoEn: "2025-04-01T12:00:00Z",
        actualizadoEn: "2025-04-02T09:30:00Z",
      },
      {
        ingresoId: 102,
        usuarioId: usuarioIdResuelto,
        tipoId: 3,
        procedenciaId: null,
        monto: 2500.5,
        descripcion: "Venta freelance",
        fechaInicio: "2025-04-10T00:00:00Z",
        fechaFin: "2025-04-10T23:59:59Z",
        creadoEn: "2025-04-10T08:00:00Z",
        actualizadoEn: "2025-04-10T08:00:00Z",
      },
      {
        ingresoId: 103,
        usuarioId: usuarioIdResuelto,
        tipoId: 2,
        procedenciaId: 6,
        monto: 19000,
        descripcion: "Sueldo mayo",
        fechaInicio: "2025-05-01T00:00:00Z",
        fechaFin: "2025-05-31T23:59:59Z",
        creadoEn: "2025-05-01T12:00:00Z",
        actualizadoEn: "2025-05-02T09:30:00Z",
      },
    ];

    let filtered = mockIngresos.filter(
      (ingreso) => ingreso.usuarioId === usuarioIdResuelto
    );

    if (query.tipoId) {
      filtered = filtered.filter((ingreso) => ingreso.tipoId === query.tipoId);
    }
    if (query.procedenciaId) {
      filtered = filtered.filter(
        (ingreso) => ingreso.procedenciaId === query.procedenciaId
      );
    }
    if (query.desde) {
      filtered = filtered.filter(
        (ingreso) => new Date(ingreso.fechaInicio) >= new Date(query.desde!)
      );
    }
    if (query.hasta) {
      filtered = filtered.filter(
        (ingreso) => new Date(ingreso.fechaFin ?? ingreso.fechaInicio) <= new Date(query.hasta!)
      );
    }
    if (query.min !== undefined) {
      filtered = filtered.filter((ingreso) => ingreso.monto >= query.min!);
    }
    if (query.max !== undefined) {
      filtered = filtered.filter((ingreso) => ingreso.monto <= query.max!);
    }

    const [campo, direccion] = query.orden.split(":");
    filtered = filtered.sort((a, b) => {
      const factor = direccion === "asc" ? 1 : -1;
      if (campo === "monto") {
        return (a.monto - b.monto) * factor;
      }
      if (campo === "fechaInicio") {
        return (
          (new Date(a.fechaInicio).getTime() -
            new Date(b.fechaInicio).getTime()) * factor
        );
      }
      return (
        (new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime()) *
        factor
      );
    });

    const total = filtered.length;
    const offset = (query.pagina - 1) * query.tamanoPagina;
    const paginated = filtered.slice(offset, offset + query.tamanoPagina);

    return { ingresos: paginated, total };
  }

  async crear(
    body: CrearIngresoBody,
    usuarioIdResuelto: number
  ): Promise<number> {
    if (db.enabled && db.pool) {
      try {
        const resultSets = await db.call("sp_ingresos_crear", [
          usuarioIdResuelto,
          body.tipoId,
          body.procedenciaId ?? null,
          body.monto,
          body.fechaInicio,
          body.fechaFin ?? null,
          body.descripcion ?? null,
        ]);

        const rows = resultSets[0] as any[];
        if (rows && rows.length > 0 && rows[0].ingresoId) {
          return Number(rows[0].ingresoId);
        }
      } catch (error: any) {
        console.error("Error en sp_ingresos_crear:", error);
        if (error.message && error.message.includes("FK_INEXISTENTE")) {
          throw new Error(
            "FK_INEXISTENTE: tipoId o procedenciaId no existe"
          );
        }
      }
    }

    return Math.floor(Math.random() * 1000) + 100;
  }

  async obtener(ingresoId: number): Promise<IngresoDTO | null> {
    if (db.enabled && db.pool) {
      try {
        const resultSets = await db.call("sp_ingresos_obtener", [ingresoId]);
        const rows = resultSets[0] as any[];

        if (rows && rows.length > 0) {
          return this.mapRow(rows[0]);
        }
      } catch (error: any) {
        console.error("Error en sp_ingresos_obtener:", error);
        if (error.message && error.message.includes("NO_ENCONTRADO")) {
          return null;
        }
      }
    }

    if (ingresoId === 101) {
      return {
        ingresoId: 101,
        usuarioId: 23,
        tipoId: 2,
        procedenciaId: 5,
        monto: 18500,
        descripcion: "Sueldo abril",
        fechaInicio: "2025-04-01T00:00:00Z",
        fechaFin: "2025-04-30T23:59:59Z",
        creadoEn: "2025-04-01T12:00:00Z",
        actualizadoEn: "2025-04-02T09:30:00Z",
      };
    }

    return null;
  }

  async actualizar(
    ingresoId: number,
    body: ActualizarIngresoBody,
    usuarioIdResuelto: number
  ): Promise<boolean> {
    if (db.enabled && db.pool) {
      try {
        const actual = await this.obtener(ingresoId);
        if (!actual) {
          return false;
        }

        const resultSets = await db.call("sp_ingresos_actualizar", [
          ingresoId,
          usuarioIdResuelto,
          body.tipoId ?? actual.tipoId,
          body.procedenciaId !== undefined ? body.procedenciaId : actual.procedenciaId,
          body.monto ?? actual.monto,
          body.fechaInicio ?? actual.fechaInicio,
          body.fechaFin !== undefined ? body.fechaFin : actual.fechaFin,
          body.descripcion !== undefined ? body.descripcion : actual.descripcion,
        ]);

        const rows = resultSets[0] as any[];
        if (rows && rows.length > 0 && rows[0].actualizado !== undefined) {
          return Boolean(rows[0].actualizado);
        }
      } catch (error: any) {
        console.error("Error en sp_ingresos_actualizar:", error);
        if (error.message && error.message.includes("FK_INEXISTENTE")) {
          throw new Error(
            "FK_INEXISTENTE: tipoId o procedenciaId no existe"
          );
        }
      }
    }

    const existe = await this.obtener(ingresoId);
    return existe !== null;
  }

  async eliminar(
    ingresoId: number,
    usuarioIdResuelto: number
  ): Promise<boolean> {
    if (db.enabled && db.pool) {
      try {
        const resultSets = await db.call("sp_ingresos_eliminar", [
          ingresoId,
          usuarioIdResuelto,
        ]);

        const rows = resultSets[0] as any[];
        if (rows && rows.length > 0 && rows[0].eliminado !== undefined) {
          return Boolean(rows[0].eliminado);
        }
      } catch (error) {
        console.error("Error en sp_ingresos_eliminar:", error);
      }
    }

    const existe = await this.obtener(ingresoId);
    return existe !== null;
  }
}

export const ingresosRepository = new IngresosRepository();
