import { Router } from "express";
import * as controller from "../controllers/catalogos.controller";
import { validarJWT, validarScopes } from "../middlewares/auth";

const router = Router();

// 🔹 Rutas CRUD
router.get(
  "/frecuencias",
  validarJWT,
  validarScopes(["catalogos:leer"]),
  controller.listarFrecuencias
);

router.post(
  "/frecuencias",
  validarJWT,
  validarScopes(["catalogos:escribir", "admin:catalogos"]),
  controller.crearFrecuencia
);

router.put(
  "/frecuencias/:id",
  validarJWT,
  validarScopes(["catalogos:escribir", "admin:catalogos"]),
  controller.actualizarFrecuencia
);

router.delete(
  "/frecuencias/:id",
  validarJWT,
  validarScopes(["catalogos:escribir", "admin:catalogos"]),
  controller.eliminarFrecuencia
);

export default router;
