const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ---- DATA SIMULADA (como si fuera BD) ----
let tiposIngreso = [
  { id: 1, nombre: "Salario" },
  { id: 2, nombre: "Venta" }
];

// ---- ENDPOINTS CRUD ----

// GET - obtener todos
app.get("/tipos-ingreso", (req, res) => {
  res.json(tiposIngreso);
});

// GET - obtener por ID
app.get("/tipos-ingreso/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const tipo = tiposIngreso.find(t => t.id === id);

  if (!tipo) return res.status(404).json({ mensaje: "No encontrado" });

  res.json(tipo);
});

// POST - agregar nuevo
app.post("/tipos-ingreso", (req, res) => {
  const { nombre } = req.body;

  if (!nombre)
    return res.status(400).json({ mensaje: "El nombre es obligatorio" });

  const nuevo = {
    id: tiposIngreso.length + 1,
    nombre
  };

  tiposIngreso.push(nuevo);
  res.status(201).json(nuevo);
});

// PUT - actualizar
app.put("/tipos-ingreso/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre } = req.body;

  const tipo = tiposIngreso.find(t => t.id === id);
  if (!tipo) return res.status(404).json({ mensaje: "No encontrado" });

  tipo.nombre = nombre || tipo.nombre;

  res.json(tipo);
});

// DELETE - eliminar
app.delete("/tipos-ingreso/:id", (req, res) => {
  const id = parseInt(req.params.id);
  tiposIngreso = tiposIngreso.filter(t => t.id !== id);

  res.json({ mensaje: "Eliminado" });
});

// ---- INICIAR SERVIDOR ----
app.listen(3000, () => {
  console.log("API Tipos de Ingreso corriendo en http://localhost:3000");
});
