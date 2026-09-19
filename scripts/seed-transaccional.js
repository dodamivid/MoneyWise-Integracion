/**
 * Seed de datos transaccionales (issue #65).
 *
 * A diferencia de `scripts/import-db.js` (que importa el schema completo
 * con acceso directo a MySQL), este script NO se conecta a la base de
 * datos directamente: crea todo via los endpoints reales de la API
 * (`/api/v1/auth/registro`, `/ingresos`, `/egresos`, `/inversiones`,
 * `/metas`, `/catalogos/destinos`), para que los datos pasen por las
 * mismas validaciones de negocio (Zod, reglas de los stored procedures,
 * conversion de fechas) que usaria un cliente real.
 *
 * Requiere variables de entorno:
 *   MWI_API_URL  - base de la API, ej: https://moneywise-integracion-production.up.railway.app
 *   MWI_API_KEY  - valor real de x-api-key (Railway -> Variables, ver CLAUDE.md)
 *
 * No requiere credenciales de MySQL.
 *
 * Idempotencia: es idempotente a nivel usuario+recurso, no a nivel de
 * fila individual. Antes de sembrar ingresos/egresos/inversiones/metas
 * de un usuario, revisa si ese usuario ya tiene registros de ese tipo;
 * si ya tiene, se salta ese recurso completo para no duplicar. Volver a
 * correr el script no crea usuarios duplicados (usa un password fijo y
 * hace login si el registro ya existe) ni duplica movimientos ya
 * sembrados, pero tampoco "completa" un sembrado parcial fila por fila.
 *
 * Uso:
 *   MWI_API_URL=... MWI_API_KEY=... node scripts/seed-transaccional.js
 */

const BASE_URL = process.env.MWI_API_URL;
const API_KEY = process.env.MWI_API_KEY;

if (!BASE_URL || !API_KEY) {
  throw new Error("Faltan variables MWI_API_URL o MWI_API_KEY");
}

const MESES_HISTORIA = Number(process.env.MWI_SEED_MESES ?? 12);
const SEED_PASSWORD = "SeedMW2026!";
const CONCURRENCIA = Number(process.env.MWI_SEED_CONCURRENCIA ?? 6);
// Util para probar el script contra pocos usuarios antes de correrlo
// completo (ej. MWI_SEED_USUARIOS=1 node scripts/seed-transaccional.js).
const LIMITE_USUARIOS = process.env.MWI_SEED_USUARIOS
  ? Number(process.env.MWI_SEED_USUARIOS)
  : undefined;

// -----------------------------------------------------------------------
// Usuarios de ejemplo
// -----------------------------------------------------------------------
const SEED_USERS = [
  { nombre: "Ana", apellidoP: "Martinez", apellidoM: "Lopez", correo: "ana.martinez.seed@moneywise.test", fechaN: "1993-04-12", sueldoBase: 14000 },
  { nombre: "Luis", apellidoP: "Hernandez", apellidoM: "Garcia", correo: "luis.hernandez.seed@moneywise.test", fechaN: "1988-11-03", sueldoBase: 22000 },
  { nombre: "Sofia", apellidoP: "Ramirez", apellidoM: "Torres", correo: "sofia.ramirez.seed@moneywise.test", fechaN: "1995-07-22", sueldoBase: 11000 },
  { nombre: "Diego", apellidoP: "Flores", apellidoM: "Castillo", correo: "diego.flores.seed@moneywise.test", fechaN: "1990-02-15", sueldoBase: 18000 },
  { nombre: "Valeria", apellidoP: "Morales", apellidoM: "Reyes", correo: "valeria.morales.seed@moneywise.test", fechaN: "1997-09-30", sueldoBase: 9500 },
];

// Destinos personales extra que cada usuario crea para sí mismo (además
// de los 4 globales: Renta, Servicios, Transporte, Alimentación). Ver
// nota en el PR: no se amplió el catálogo global porque este script no
// tiene acceso directo a MySQL, solo a la API — y la API fuerza
// es_por_defecto=0 (catálogo per-usuario) en cualquier POST, por diseño
// (issue #82). Así que la variedad de ~10-12 destinos se logra por
// usuario, no de forma global.
const DESTINOS_PERSONALES = ["Salud", "Educación", "Entretenimiento", "Ropa", "Mascotas", "Impuestos"];

const ALL_SCOPES =
  "ingresos:leer,ingresos:escribir,egresos:leer,egresos:escribir,inversiones:leer,inversiones:escribir,metas:leer,metas:escribir,catalogos:leer,catalogos:escribir,dashboard:leer";

// -----------------------------------------------------------------------
// Utilidades
// -----------------------------------------------------------------------

async function api(method, path, { usuarioId, body } = {}) {
  const headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  };
  if (usuarioId !== undefined) {
    headers["x-mw-user"] = String(usuarioId);
    headers["x-mw-scopes"] = ALL_SCOPES;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return { status: res.status, ok: res.ok, body: json };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function isoDate(year, monthIndex0, day, hour = 12) {
  // Construye una fecha valida (evita dias fuera de rango, p.ej. 31 de febrero)
  const d = new Date(Date.UTC(year, monthIndex0, 1, hour, 0, 0));
  const ultimoDiaDelMes = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, ultimoDiaDelMes));
  return d.toISOString();
}

// Pool simple de concurrencia para no saturar Railway con miles de
// requests simultaneos.
async function runPool(items, worker, concurrencia = CONCURRENCIA) {
  const results = [];
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const current = idx++;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrencia, items.length) }, next));
  return results;
}

// -----------------------------------------------------------------------
// Catalogos
// -----------------------------------------------------------------------

async function obtenerCatalogosGlobales() {
  const [tiposIngreso, tiposEgreso, procedencias, destinos] = await Promise.all([
    api("GET", "/api/v1/catalogos/tipos-ingreso?tamanoPagina=50", { usuarioId: 1 }),
    api("GET", "/api/v1/catalogos/tipos-egreso?tamanoPagina=50", { usuarioId: 1 }),
    api("GET", "/api/v1/catalogos/procedencias?tamanoPagina=50", { usuarioId: 1 }),
    api("GET", "/api/v1/catalogos/destinos?tamanoPagina=50", { usuarioId: 1 }),
  ]);

  return {
    tiposIngreso: tiposIngreso.body.data,
    tiposEgreso: tiposEgreso.body.data,
    procedencias: procedencias.body.data,
    destinosGlobales: destinos.body.data,
  };
}

async function asegurarDestinosPersonales(usuarioId, destinosGlobales) {
  for (const nombre of DESTINOS_PERSONALES) {
    const resp = await api("POST", "/api/v1/catalogos/destinos", {
      usuarioId,
      body: { usuarioId, nombre },
    });
    const yaExiste = resp.body?.mensaje?.includes("Ya existe");
    if (!resp.ok && !yaExiste) {
      // Nota: los duplicados de catalogos responden 400 (BadRequestError),
      // no 409, aunque semanticamente sean un conflicto -- inconsistencia
      // preexistente en catalogos.service.ts, no se toca aqui.
      console.warn(`  [!] No se pudo crear destino personal "${nombre}":`, resp.body);
    }
  }

  const listado = await api("GET", "/api/v1/catalogos/destinos?tamanoPagina=50", { usuarioId });
  return listado.body.data; // globales + personales de este usuario, combinados
}

// -----------------------------------------------------------------------
// Usuarios
// -----------------------------------------------------------------------

async function asegurarUsuario(u) {
  const registro = await api("POST", "/api/v1/auth/registro", {
    body: {
      nombre: u.nombre,
      apellidoP: u.apellidoP,
      apellidoM: u.apellidoM,
      correo: u.correo,
      fechaN: u.fechaN,
      contrasena: SEED_PASSWORD,
    },
  });

  if (registro.ok) {
    return { usuarioId: registro.body.data.usuarioId, nuevo: true };
  }

  // Ya existe -> login para recuperar el usuarioId
  const login = await api("POST", "/api/v1/auth/acceso", {
    body: { correo: u.correo, contrasena: SEED_PASSWORD },
  });

  if (!login.ok) {
    throw new Error(
      `No se pudo registrar ni loguear a ${u.correo}. Registro: ${JSON.stringify(
        registro.body
      )} Login: ${JSON.stringify(login.body)}`
    );
  }

  return { usuarioId: login.body.data.usuario.usuarioId, nuevo: false };
}

async function totalDe(recurso, usuarioId) {
  // ingresos/egresos/inversiones derivan el usuarioId del propio
  // x-mw-user (mandar ?usuarioId= ahi requiere scope admin:*, que este
  // script no tiene). metas es la excepcion: NO deriva usuarioId del
  // auth context (issue #89, ver CLAUDE.md "Problemas Conocidos"), asi
  // que hay que mandarlo explicito o siempre devuelve total=0.
  const query = recurso === "metas" ? `?tamanoPagina=1&usuarioId=${usuarioId}` : "?tamanoPagina=1";
  const resp = await api("GET", `/api/v1/${recurso}${query}`, { usuarioId });
  if (!resp.ok) return 0;
  return resp.body?.meta?.paginacion?.total ?? 0;
}

// -----------------------------------------------------------------------
// Generadores de movimientos
// -----------------------------------------------------------------------

function mesesHaciaAtras(n) {
  const ahora = new Date();
  const meses = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - i, 1));
    meses.push({ year: d.getUTCFullYear(), monthIndex0: d.getUTCMonth() });
  }
  return meses;
}

function generarIngresosDelMes(mes, sueldoBase, tiposIngreso, procedencias) {
  const empresa = procedencias.find((p) => p.nombre === "Empresa") ?? procedencias[0];
  const freelance = procedencias.find((p) => p.nombre === "Freelance") ?? procedencias[0];
  const transferencia = tiposIngreso.find((t) => t.nombre === "Transferencia") ?? tiposIngreso[0];
  const bonos = tiposIngreso.find((t) => t.nombre === "Bonos") ?? tiposIngreso[0];

  const items = [
    {
      tipoId: transferencia.tipoIngresoId,
      procedenciaId: empresa.procedenciaId,
      monto: randFloat(sueldoBase * 0.48, sueldoBase * 0.52),
      descripcion: "Sueldo quincenal",
      fechaInicio: isoDate(mes.year, mes.monthIndex0, 1),
    },
    {
      tipoId: transferencia.tipoIngresoId,
      procedenciaId: empresa.procedenciaId,
      monto: randFloat(sueldoBase * 0.48, sueldoBase * 0.52),
      descripcion: "Sueldo quincenal",
      fechaInicio: isoDate(mes.year, mes.monthIndex0, 15),
    },
  ];

  if (Math.random() < 0.3) {
    items.push({
      tipoId: bonos.tipoIngresoId,
      procedenciaId: freelance.procedenciaId,
      monto: randFloat(1000, 4500),
      descripcion: pick(["Proyecto freelance", "Bono de desempeño", "Trabajo extra"]),
      fechaInicio: isoDate(mes.year, mes.monthIndex0, randInt(2, 27)),
    });
  }

  return items;
}

function generarEgresosDelMes(mes, destinos, tiposEgreso) {
  const porNombre = (nombre) => destinos.find((d) => d.nombre === nombre);
  const tipo = (nombre) => tiposEgreso.find((t) => t.nombre === nombre) ?? tiposEgreso[0];

  // { destino, cantidadMin, cantidadMax, montoMin, montoMax, tipos[], descripciones[] }
  const plantillas = [
    { destino: "Renta", cantidad: [1, 1], monto: [3500, 7000], tipos: ["Transferencia"], desc: ["Renta mensual"] },
    { destino: "Servicios", cantidad: [3, 4], monto: [200, 900], tipos: ["Transferencia", "Tarjeta"], desc: ["Luz", "Agua", "Internet", "Gas"] },
    { destino: "Transporte", cantidad: [4, 8], monto: [50, 500], tipos: ["Efectivo", "Tarjeta"], desc: ["Gasolina", "Uber", "Transporte público", "Estacionamiento"] },
    { destino: "Alimentación", cantidad: [8, 14], monto: [80, 900], tipos: ["Efectivo", "Tarjeta"], desc: ["Supermercado", "Restaurante", "Comida rápida", "Mercado"] },
    { destino: "Salud", cantidad: [0, 2], monto: [150, 2000], tipos: ["Tarjeta", "Efectivo"], desc: ["Consulta médica", "Farmacia", "Seguro médico"] },
    { destino: "Educación", cantidad: [0, 1], monto: [300, 3000], tipos: ["Transferencia"], desc: ["Colegiatura", "Curso", "Libros"] },
    { destino: "Entretenimiento", cantidad: [1, 4], monto: [100, 800], tipos: ["Tarjeta"], desc: ["Cine", "Streaming", "Salida con amigos"] },
    { destino: "Ropa", cantidad: [0, 2], monto: [200, 1500], tipos: ["Tarjeta"], desc: ["Ropa", "Calzado"] },
    { destino: "Mascotas", cantidad: [0, 2], monto: [150, 900], tipos: ["Efectivo", "Tarjeta"], desc: ["Veterinario", "Alimento para mascota"] },
    { destino: "Impuestos", cantidad: [0, 1], monto: [500, 2500], tipos: ["Transferencia"], desc: ["Pago de impuestos", "Trámite gubernamental"] },
  ];

  const items = [];
  for (const p of plantillas) {
    const destino = porNombre(p.destino);
    if (!destino) continue;
    const cantidad = randInt(p.cantidad[0], p.cantidad[1]);
    for (let i = 0; i < cantidad; i++) {
      items.push({
        tipoId: tipo(pick(p.tipos)).tipoEgresoId,
        destinoId: destino.destinoId,
        monto: randFloat(p.monto[0], p.monto[1]),
        descripcion: pick(p.desc),
        fechaInicio: isoDate(mes.year, mes.monthIndex0, randInt(1, 28)),
      });
    }
  }
  return items;
}

function generarInversiones(meses, destinos) {
  const objetivos = ["Fondo de emergencia", "Retiro", "Compra de auto", "Enganche de casa", "Viaje"];
  const cantidad = randInt(2, 4);
  const items = [];
  for (let i = 0; i < cantidad; i++) {
    const mes = pick(meses);
    const destino = Math.random() < 0.5 ? pick(destinos) : null;
    const tieneFin = Math.random() < 0.4;
    items.push({
      destinoId: destino ? destino.destinoId : null,
      monto: randFloat(2000, 40000),
      objetivo: pick(objetivos),
      fechaInicio: isoDate(mes.year, mes.monthIndex0, randInt(1, 20)),
      fechaFin: tieneFin ? isoDate(mes.year, mes.monthIndex0 + randInt(3, 10), 15) : null,
      tasaInteresPorc: randFloat(3, 12, 1),
    });
  }
  return items;
}

function generarMetas() {
  const nombres = ["Vacaciones", "Fondo de emergencia", "Nuevo laptop", "Boda", "Remodelación"];
  const cantidad = randInt(2, 3);
  const items = [];
  const usados = new Set();
  for (let i = 0; i < cantidad; i++) {
    let nombre = pick(nombres);
    while (usados.has(nombre) && usados.size < nombres.length) nombre = pick(nombres);
    usados.add(nombre);

    const montoObjetivo = randFloat(5000, 100000, 2);
    const inicio = new Date();
    inicio.setUTCMonth(inicio.getUTCMonth() - randInt(1, 8));

    items.push({
      nombre,
      montoObjetivo,
      fechaInicio: inicio.toISOString(),
      activa: true,
      ahorroRealObjetivo: randFloat(0, montoObjetivo * 0.6, 2), // se aplica despues con PATCH
    });
  }
  return items;
}

// -----------------------------------------------------------------------
// Sembrado por usuario
// -----------------------------------------------------------------------

async function sembrarUsuario(userDef, catalogos) {
  console.log(`\n=== ${userDef.correo} ===`);
  const { usuarioId, nuevo } = await asegurarUsuario(userDef);
  console.log(`  usuarioId=${usuarioId} (${nuevo ? "creado" : "ya existia"})`);

  const destinos = await asegurarDestinosPersonales(usuarioId, catalogos.destinosGlobales);
  const meses = mesesHaciaAtras(MESES_HISTORIA);

  // --- Ingresos ---
  const totalIngresos = await totalDe("ingresos", usuarioId);
  if (totalIngresos > 0) {
    console.log(`  ingresos: ya tiene ${totalIngresos}, se salta`);
  } else {
    const items = meses.flatMap((m) =>
      generarIngresosDelMes(m, userDef.sueldoBase, catalogos.tiposIngreso, catalogos.procedencias)
    );
    const resultados = await runPool(items, (item) =>
      api("POST", "/api/v1/ingresos", { usuarioId, body: item })
    );
    const ok = resultados.filter((r) => r.ok).length;
    console.log(`  ingresos: ${ok}/${items.length} creados`);
  }

  // --- Egresos ---
  const totalEgresos = await totalDe("egresos", usuarioId);
  if (totalEgresos > 0) {
    console.log(`  egresos: ya tiene ${totalEgresos}, se salta`);
  } else {
    const items = meses.flatMap((m) => generarEgresosDelMes(m, destinos, catalogos.tiposEgreso));
    const resultados = await runPool(items, (item) =>
      api("POST", "/api/v1/egresos", { usuarioId, body: item })
    );
    const ok = resultados.filter((r) => r.ok).length;
    console.log(`  egresos: ${ok}/${items.length} creados`);
  }

  // --- Inversiones ---
  const totalInversiones = await totalDe("inversiones", usuarioId);
  if (totalInversiones > 0) {
    console.log(`  inversiones: ya tiene ${totalInversiones}, se salta`);
  } else {
    const items = generarInversiones(meses, destinos);
    const resultados = await runPool(items, (item) =>
      api("POST", "/api/v1/inversiones", { usuarioId, body: item })
    );
    const ok = resultados.filter((r) => r.ok).length;
    console.log(`  inversiones: ${ok}/${items.length} creadas`);
  }

  // --- Metas ---
  const totalMetas = await totalDe("metas", usuarioId);
  if (totalMetas > 0) {
    console.log(`  metas: ya tiene ${totalMetas}, se salta`);
  } else {
    const items = generarMetas();
    for (const item of items) {
      const { ahorroRealObjetivo, ...body } = item;
      const creada = await api("POST", "/api/v1/metas", {
        usuarioId,
        body: { ...body, usuarioId },
      });
      if (!creada.ok) {
        console.warn(`  [!] No se pudo crear meta "${item.nombre}":`, creada.body);
        continue;
      }
      const metaId = creada.body.data.metaId;
      if (ahorroRealObjetivo > 0) {
        await api("PATCH", `/api/v1/metas/${metaId}`, {
          usuarioId,
          body: { ahorroReal: ahorroRealObjetivo },
        });
      }
    }
    console.log(`  metas: ${items.length} creadas`);
  }
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

async function main() {
  const usuarios = LIMITE_USUARIOS ? SEED_USERS.slice(0, LIMITE_USUARIOS) : SEED_USERS;

  console.log(`Sembrando datos transaccionales contra ${BASE_URL}`);
  console.log(`Usuarios: ${usuarios.length} | Meses de historia: ${MESES_HISTORIA}`);

  const catalogos = await obtenerCatalogosGlobales();

  for (const userDef of usuarios) {
    await sembrarUsuario(userDef, catalogos);
  }

  console.log("\nSembrado completado.");
  console.log(
    "Nota: fechas_corte_ahorro NO se sembro -- no existe endpoint para crearla todavia (issue #91)."
  );
}

main().catch((err) => {
  console.error("Error en el seed:", err);
  process.exit(1);
});
