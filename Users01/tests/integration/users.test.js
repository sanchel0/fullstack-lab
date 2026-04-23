import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js"; // Asegúrate de que exporte la app de express
import UserModel from "../../src/models/user.model.js";
import redis from "../../src/config/redis.js";
import { ROLES } from "../../src/utils/constants.js";

// Mockeamos el modelo y redis para no tocar la BD real
vi.mock("../../src/models/user.model.js");
vi.mock("../../src/config/redis.js", () => ({
  default: {
    del: vi.fn().mockResolvedValue(1),
  },
}));
vi.mock("../../src/middlewares/auth.middleware.js", () => ({
  verifyToken: (req, res, next) => {
    // Simulamos que el usuario ya pasó la aduana y es un Admin
    req.user = { id: 1, username: "admin_test", role: ROLES.ADMIN };
    next();
  },
  // 2. Mockear checkRole (es una función que devuelve otra función)
  checkRole: (allowedRoles) => (req, res, next) => next(),
}));

describe("User Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpia los contadores de llamadas entre tests
  });

  describe("POST /api/users (createUser)", () => {
    it("debe devolver 400 si faltan campos obligatorios", async () => {
      const response = await request(app)
        .post("/api/users")
        .send({ username: "pepe" }); // Falta email y password

      if (response.status === 500) {
        console.log("EL ERROR 500 ES:", response.body);
      }

      expect(response.status).toBe(400);
      // 1. Verificamos que 'error' sea un array (tal como lo configuraste en el middleware)
      expect(Array.isArray(response.body.error)).toBe(true);

      // 2. Verificamos que reporte los campos que faltan
      const camposConError = response.body.error.map((err) => err.field);
      expect(camposConError).toContain("email");
      expect(camposConError).toContain("password");
      expect(camposConError).toContain("first_name");
      expect(camposConError).toContain("last_name");
    });

    it("debe crear un usuario exitosamente y devolver 21", async () => {
      // Configuramos el mock para que simule una creación exitosa
      UserModel.create.mockResolvedValue({
        id: 99,
        username: "admin_test",
        email: "test@test.com",
      });

      const response = await request(app).post("/api/users").send({
        username: "admin_test",
        email: "test@test.com",
        password: "password123",
        first_name: "Admin",
        last_name: "Test",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Usuario creado por admin");
      expect(response.body.user.id).toBe(99);
    });
  });

  describe("GET /api/users/:id (getUserById)", () => {
    it("debe devolver 404 si el usuario no existe", async () => {
      UserModel.findById.mockResolvedValue(null);

      const response = await request(app).get("/api/users/999");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe(
        "No se encontró el usuario con el ID 999.",
      );
    });

    it("debe devolver el usuario si existe", async () => {
      const mockUser = { id: 1, username: "pepe" };
      UserModel.findById.mockResolvedValue(mockUser);

      const response = await request(app).get("/api/users/1");

      expect(response.status).toBe(200);
      expect(response.body.username).toBe("pepe");
    });
  });

  it("debe sanitizar scripts maliciosos en el username", async () => {
    const ataqueXSS = "<script>alert('xss')</script>Pepe";

    // Mockeamos el create para ver qué le llega finalmente al Modelo
    UserModel.create.mockImplementation((datos) => {
      console.log("-----------------------------------------");
      console.log("DATOS QUE LLEGAN AL MODELO:", datos.username);
      console.log("-----------------------------------------");
      return { id: 1, ...datos };
    });

    const response = await request(app).post("/api/users").send({
      username: ataqueXSS, // Enviamos el script
      email: "test@test.com",
      password: "password123",
      first_name: "Test",
      last_name: "User",
    });

    // El status debería ser 201 (porque no es un error, es una limpieza)
    expect(response.status).toBe(201);

    // Verificamos que el username NO tenga los símbolos < >
    expect(response.body.user.username).not.toContain("<script>");
    // Debería verse algo como: &lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;Pepe
  });
});
