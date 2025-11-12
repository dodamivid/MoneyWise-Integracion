"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inversionesRepository = void 0;
const db_1 = require("../config/db");
exports.inversionesRepository = {
    async findAll() {
        const [rows] = await db_1.db.query("SELECT * FROM inversiones");
        return rows;
    },
    async findById(id) {
        const [rows] = await db_1.db.query("SELECT * FROM inversiones WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    },
    async create(data) {
        const [result] = await db_1.db.query("INSERT INTO inversiones SET ?", [data]);
        return { id: result.insertId, ...data };
    },
    async update(id, data) {
        await db_1.db.query("UPDATE inversiones SET ? WHERE id = ?", [data, id]);
        return this.findById(id);
    },
    async remove(id) {
        await db_1.db.query("DELETE FROM inversiones WHERE id = ?", [id]);
    },
};
