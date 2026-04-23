import UserModel from "../models/user.model.js";
import { filterAllowedFields } from "../utils/utils.js";
import logger from "../utils/logger.js";
import redis from "../config/redis.js";

export const createUser = async (req, res) => {
  const { username, email, password, first_name, last_name, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error:
        "Faltan datos obligatorios: username, email y password son necesarios.",
    });
  }

  try {
    // Nota: Aquí 'password' se mapea a 'password_hash' del modelo
    const newUser = await UserModel.create({
      username,
      email,
      password_hash: password,
      first_name,
      last_name,
      role: role || "user",
    });

    res.status(201).json({
      message: "Usuario creado por admin",
      user: newUser,
    });
  } catch (error) {
    console.error("Error en createUser Controller:", error.message);

    if (error.code === "23505") {
      // Código de Postgres para "Unique Violation"
      return res
        .status(409)
        .json({ error: "El username o el email ya están registrados." });
    }

    res
      .status(500)
      .json({ error: "Hubo un problema al procesar la solicitud." });
  }
};

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { username, email, role_id } = req.body;

  try {
    // Verificar si el usuario existe antes de intentar actualizar
    const userExists = await UserModel.findById(id);
    if (!userExists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const updatedUser = await UserModel.update(id, req.body);

    // ⚡ LIMPIAR CACHÉ DE REDIS ⚡
    // Borramos la sesión de este usuario para que la próxima vez
    // que se valide el token, se busquen los datos nuevos en la DB.
    const redisKey = `user:session:${id}`;
    await redis.del(redisKey);

    // Log de Auditoría (Info)
    logger.info({
      message: "USER_UPDATED",
      action: "update",
      entity: "user",
      entityId: id,
      userId: req.user.id,
    });

    res.status(200).json({
      message: "USER_UPDATED",
      user: updatedUser,
    });
  } catch (error) {
    // Si la DB explota, este next(error) activa el log de ERROR
    // automáticamente en el Error Handler Global (errorHandler.js).
    next(error);
  }
};

// Función para obtener todos los usuarios
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();
    throw new Error("errorrrrr test");
  } catch (error) {
    console.error("Error en getAllUsers Controller:", error.message);
    res.status(500).json({ error: "Error al obtener los usuarios." });
    next(error);
  }
};

// Función para obtener un usuario por su ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // CAMBIO AQUÍ: Llamamos al método que acabamos de crear en la clase
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        error: `No se encontró el usuario con el ID ${id}.`,
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error en getUserById Controller:", error.message);
    res.status(500).json({ error: "Error al buscar el usuario." });
  }
};

export const getProfile = async (req, res) => {
  try {
    // El middleware 'verifyToken' ya dejó los datos del token en 'req.user'
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Devolvemos los datos del usuario (excepto la contraseña)
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role_name, // Viene del JOIN que hicimos en findById
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // EL ID VIENE DEL TOKEN, NO DE LA URL
    // Esto hace imposible que un usuario edite a otro
    const userId = req.user.id;

    // Verificar si el usuario existe antes de intentar actualizar
    const userExists = await UserModel.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    // Solo permitimos campos que un usuario normal puede tocar
    //const { first_name, last_name, email } = req.body;

    /*
    // Ya no necesitas filterAllowedFields ni Object.keys().length === 0
    // porque el middleware ya se encargó de eso.
    const allowed = ["first_name", "last_name", "email"];
    const dataToUpdate = filterAllowedFields(req.body, allowed);

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "Nada que actualizar" });
    }*/

    // --- LÓGICA DE MEZCLA PARA JSONB ---
    let dataToUpdate = { ...req.body };

    if (req.body.preferences) {
      // Mezclamos lo que ya tiene el usuario con lo nuevo que llega
      dataToUpdate.preferences = {
        ...userExists.preferences, // 1. Copia TODO lo que ya había en la BD
        ...req.body.preferences, // 2. Sobrescribe SOLO lo que viene de la petición
      };
    }
    /*Si el Frontend envía solo el idioma:
      await updateProfile({ preferences: { language: 'en' } });

      Y tu controlador hace esto directamente:
      const updatedUser = await UserModel.update(id, req.body);

      Resultado en la BD: PostgreSQL reemplaza todo el objeto. Si antes tenías {"theme": "dark", "language": "es"}, ahora solo tendrás {"language": "en"}. ¡El tema oscuro desapareció!
    Imagina este ejemplo real:

      - En la BD (userExists.preferences): { "theme": "dark", "language": "es" }
      - En el req.body.preferences: { "language": "en" }
        - Primero pone theme: "dark" y language: "es".
        - Luego ve que el nuevo objeto trae language: "en", así que solo cambia el idioma.
        - Como el nuevo objeto no trae theme, el valor "dark" se mantiene intacto.
        - Resultado final enviado a la BD: { "theme": "dark", "language": "en" }. ¡Salvaste el tema oscuro! 🌙
    */

    const updatedUser = await UserModel.update(userId, dataToUpdate);

    res.json({
      message: "Tu perfil ha sido actualizado",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};
