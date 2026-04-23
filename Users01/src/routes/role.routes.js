import { Router } from "express";
import { getRoles } from "../controllers/role.controller.js";
// Importa tu middleware de autenticación si quieres protegerla
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/roles
router.get("/", verifyToken, checkRole("admin"), getRoles);

export default router;
