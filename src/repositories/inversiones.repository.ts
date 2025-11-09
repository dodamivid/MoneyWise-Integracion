import { db } from "../config/db";
import { Inversion } from "../dtos/inversiones.dto";

export const inversionesRepository = {
  async findAll() {
    const [rows]: any = await db.query("SELECT * FROM inversiones");
    return rows;
  },

  async findById(id: number) {
    const [rows]: any = await db.query("SELECT * FROM inversiones WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  },

  async create(data: Inversion) {
    const [result]: any = await db.query("INSERT INTO inversiones SET ?", [data]);
    return { id: result.insertId, ...data };
  },

  async update(id: number, data: Partial<Inversion>) {
    await db.query("UPDATE inversiones SET ? WHERE id = ?", [data, id]);
    return this.findById(id);
  },

  async remove(id: number) {
    await db.query("DELETE FROM inversiones WHERE id = ?", [id]);
  },
};
