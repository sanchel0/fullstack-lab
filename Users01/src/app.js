import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import roleRoutes from "./routes/role.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// --- TUS MIDDLEWARES ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// --- TUS RUTAS ---
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "Servidor funcionando correctamente" });
});

// --- ERROR HANDLER ---
app.use(errorHandler);

// EXPORTACIÓN CRUCIAL PARA SUPERTEST
export default app;
