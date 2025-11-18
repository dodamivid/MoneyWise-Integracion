import { PoolConnection } from 'mysql2/promise';
import pool from '../config/database';

export interface TipoIngreso {
  tipoIngresoId: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TipoIngresoListado extends TipoIngreso {}

export class TiposIngresoRepository {
  
  async listar(
    pagina: number = 1,
    tamanoPagina: number = 20,
    orden: string = 'nombre:asc',
    activo?: boolean
  ): Promise<{ data: TipoIngresoListado[]; total: number }> {
    const connection: PoolConnection = await pool.getConnection();
    
    try {
      const [rows]: any = await connection.query(
        'CALL sp_tipos_ingreso_listar(?, ?, ?, ?)',
        [pagina, tamanoPagina, orden, activo ?? null]
      );

      const data = rows[0] || [];
      const total = rows[1]?.[0]?.totalRegistros || 0;

      return { data, total };
    } finally {
      connection.release();
    }
  }

  async obtenerPorId(tipoIngresoId: number): Promise<TipoIngreso | null> {
    const connection: PoolConnection = await pool.getConnection();
    
    try {
      const [rows]: any = await connection.query(
        'CALL sp_tipos_ingreso_obtener(?)',
        [tipoIngresoId]
      );

      return rows[0]?.[0] || null;
    } finally {
      connection.release();
    }
  }

  async crear(
    nombre: string,
    descripcion?: string,
    activo: boolean = true
  ): Promise<{ tipoIngresoId: number }> {
    const connection: PoolConnection = await pool.getConnection();
    
    try {
      const [rows]: any = await connection.query(
        'CALL sp_tipos_ingreso_crear(?, ?, ?)',
        [nombre, descripcion || null, activo]
      );

      return { tipoIngresoId: rows[0]?.[0]?.tipoIngresoId };
    } finally {
      connection.release();
    }
  }

  async actualizar(
    tipoIngresoId: number,
    nombre?: string,
    descripcion?: string,
    activo?: boolean
  ): Promise<{ actualizado: boolean }> {
    const connection: PoolConnection = await pool.getConnection();
    
    try {
      const [rows]: any = await connection.query(
        'CALL sp_tipos_ingreso_actualizar(?, ?, ?, ?)',
        [tipoIngresoId, nombre || null, descripcion || null, activo ?? null]
      );

      return { actualizado: rows[0]?.[0]?.actualizado || false };
    } finally {
      connection.release();
    }
  }

  async eliminar(tipoIngresoId: number): Promise<{ eliminado: boolean }> {
    const connection: PoolConnection = await pool.getConnection();
    
    try {
      const [rows]: any = await connection.query(
        'CALL sp_tipos_ingreso_eliminar(?)',
        [tipoIngresoId]
      );

      return { eliminado: rows[0]?.[0]?.eliminado || false };
    } finally {
      connection.release();
    }
  }
}