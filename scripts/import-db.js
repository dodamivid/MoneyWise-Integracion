/**
 * Importa el schema SQL completo en MySQL usando mysql2.
 * Reemplaza el default inválido para TEXT en MySQL 9 (scopes) por JSON.
 * Requiere variables de entorno: DB_HOST, DB_PORT, DB_USER, DB_PASS.
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASS } = process.env;
  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASS) {
    throw new Error('Faltan variables DB_HOST, DB_PORT, DB_USER o DB_PASS');
  }

  // Lee y normaliza el SQL, eliminando el uso de DELIMITER y ajustando el default de scopes.
  const sqlPath = path.join(__dirname, '..', 'db', 'moneywise_schema.sql');
  let sql = fs.readFileSync(sqlPath, 'utf8').replace(/\r\n/g, '\n');
  sql = sql.replace(/DELIMITER \$\$/g, '');
  sql = sql.replace(/DELIMITER ;/g, '');
  sql = sql.replace(/\$\$/g, ';');
  sql = sql.replace(/scopes TEXT NOT NULL DEFAULT '\[\]'/, 'scopes JSON NOT NULL');

  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASS,
    multipleStatements: true,
  });

  await conn.query(sql);
  await conn.end();
  console.log('Import completado');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
