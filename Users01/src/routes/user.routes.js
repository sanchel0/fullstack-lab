import { Router } from "express";
import {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  selfUpdateSchema,
  adminUpdateSchema,
  validateUser,
  validateSelfUpdate,
  validateAdminUpdate,
} from "../schemas/user.schema.js";

const router = Router();

// POST http://localhost:3000/api/users
router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  validate(validateUser),
  createUser,
);

// GET http://localhost:3000/api/users
router.get("/", verifyToken, checkRole("admin"), getAllUsers);

// Ruta para que CUALQUIER usuario logueado edite SU PROPIO perfil
// No pasamos :id porque el ID lo sacamos del Token por seguridad. Dame el usuario que soy "yo" (el dueño del token).
router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, validate(validateSelfUpdate), updateProfile);

// GET http://localhost:3000/api/users/:id
router.get("/:id", verifyToken, checkRole("admin"), getUserById);

// PUT http://localhost:3000/api/users/:id - Ruta para que el ADMIN edite a cualquier usuario por ID
router.put(
  "/:id",
  verifyToken,
  checkRole("admin"),
  validate(validateAdminUpdate),
  updateUser,
);

export default router;

/*---NOTA IMPORTANTE DE ORDEN DE RUTAS---
Si pones primero:
  - router.get("/:id", ...) ← Aquí está el culpable.
  - router.get("/me", ...)
- Express interpreta que la palabra "me" es el valor del parámetro :id.
- Entonces, Express salta al controlador getUserById. 
- Tu base de datos (PostgreSQL probablemente) intenta buscar un usuario cuyo ID sea la palabra "me". Como tu ID es un número (integer), la base de datos explota y dice: "Oye, 'me' no es un número válido".

---¿Cómo lo arreglas?
En Express, las rutas estáticas (fijas) SIEMPRE deben ir antes que las rutas dinámicas (con parámetros como :id).

// 1. PRIMERO las rutas específicas/fijas
router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, updateProfile);

// 2. DESPUÉS las rutas dinámicas con parámetros
// Así, si la URL es /me, entrará arriba. Si la URL es /15, entrará aquí.
router.get("/:id", verifyToken, checkRole("admin"), getUserById);
router.put("/:id", verifyToken, checkRole("admin"), updateUser);
*/
