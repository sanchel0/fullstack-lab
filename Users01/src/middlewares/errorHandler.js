import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  //Si el error tiene un status específico (ej: 400, 404), lo usamos. Si no tiene, por defecto es 500.
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? "Error interno del servidor" : err.message;

  // Logueamos el error con Winston
  logger.error({
    method: req.method,
    url: req.url,
    statusCode,
    message: err.message,
    stack: err.stack, // Esto te dice la línea exacta del error
    userId: req.user?.id, // Si hay un usuario logueado, lo anotamos
  });

  res.status(statusCode).json({
    status: "error",
    message: message,
  });
};

/*¿De dónde sale el err.message?
El err.message viene de tres posibles fuentes:
    - Tus Errores Personalizados: Cuando haces throw new AppError("Usuario no encontrado", 404), el mensaje es exactamente ese string.
    - Errores de Librerías (Zod, Sequelize, etc.): Si Zod falla, él genera su propio message (ej: "Invalid email").
    - Errores Nativos de Node/JS: Si intentas leer una propiedad de algo undefined, Node genera automáticamente un mensaje como "Cannot read property 'id' of undefined".

Lo mejor del Error Handler Global: No importa quién creó el error, el objeto err siempre tendrá la propiedad .message y .stack. Tu logger los atrapará todos por igual.
*/
