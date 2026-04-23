import { describe, it, expect, vi } from "vitest";
import { login } from "../../src/controllers/auth.controller.js";
import UserModel from "../../src/models/user.model.js";
import bcrypt from "bcrypt";
import * as sessionService from "../../src/services/session.service.js";

// 1. Mockeamos las dependencias
vi.mock("../../src/models/user.model.js");
vi.mock("bcrypt");
vi.mock("../../src/services/session.service.js", () => ({
  saveUserSession: vi.fn(),
  deleteUserSession: vi.fn(),
}));
vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn(() => "token_falso") },
}));

describe("Auth Controller - Login Unit Test", () => {
  it("debe devolver 401 si el usuario no existe", async () => {
    // Arrange
    UserModel.findByUsername.mockResolvedValue(null);
    const req = { body: { username: "pepe", password: "123" } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Act
    await login(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Credenciales inválidas" });
  });

  it("debe configurar la cookie httpOnly en un login exitoso", async () => {
    // Arrange
    const userFake = {
      id: 1,
      username: "pepe",
      password_hash: "hash_encriptado",
      role: "user",
    };

    UserModel.findByUsername.mockResolvedValue(userFake);
    bcrypt.compare.mockResolvedValue(true);

    // Aquí usamos el mock del servicio para que no toque Redis
    sessionService.saveUserSession.mockResolvedValue({
      id: 1,
      username: "pepe",
    });

    const req = { body: { username: "pepe", password: "123" } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    // Act
    await login(req, res);

    // Assert
    // Verificamos que se llame a la cookie con los parámetros de seguridad
    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        secure: true,
      }),
    );

    // Verificamos que la respuesta final sea 200 (implícito si no hay error)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Login exitoso",
      }),
    );
  });
});
