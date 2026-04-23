import jwt from "jsonwebtoken";
import redis from "../config/redis.js";
import UserModel from "../models/user.model.js";
import {
  saveUserSession,
  deleteUserSession,
} from "../services/session.service.js";
//En Node.js moderno, cuando importas un archivo propio, estás obligado a poner la extensión .js. Si no la pones, Node busca una carpeta o se pierde.

export const verifyToken = async (req, res, next) => {
  // Obtener el token de las cookies en lugar del header
  const token = req.cookies.token; //El catch tiene acceso total a la constante token porque ambos están dentro de la misma función verifyToken.
  // El Scope (Alcance) de la variable: En JavaScript, cuando declaras una variable con const o let al principio de una función, esa variable vive hasta que la función termina (el cierre de la llave }). Cualquier bloque que esté adentro (ya sea un if, un try o un catch) puede leerla sin problemas.

  if (!token) {
    // Si no hay cookie, el usuario no está logueado
    return res
      .status(403)
      .json({ error: "No se proporcionó un token (Sesión no encontrada)" });
  }

  try {
    // 1. Verificar el token
    const decoded = jwt.verify(token, "TU_CLAVE_SECRETA_SUPER_SEGURA");
    const userId = decoded.id;
    // 2. Buscamos en Redis la "Verdad Actual". Intentar sacar el usuario de REDIS (Rápido ⚡)
    let userData = await redis.get(`user:session:${decoded.id}`);

    if (userData) {
      // AQUÍ ESTÁ EL TRUCO:
      // Ignoramos el 'decoded' y usamos el 'userData' de Redis
      req.user = JSON.parse(userData); //----IMPORTANT... CARGA EN REQ.USER LO Q ESTÁ EN REDIS, DE ESA FORMA ya para obtener el user o su id solo hay q hacer req.user, no hace falta hacer req.cookies o req.token.user ni nada de eso...-----
      return next();
    }

    // 3. Si NO está en Redis (Lazy Loading), ir a PostgreSQL (Lento 🐢)
    console.log("Redis vacío, consultando PostgreSQL...");
    const user = await UserModel.findById(userId);
    // 4. ¿Sigue siendo válido? (Check de baneo/eliminación)
    if (!user || !user.is_active) {
      // Si el Admin lo borró o desactivó, limpiamos su cookie y afuera
      res.clearCookie("token");
      return res
        .status(401)
        .json({ error: "Sesión inválida o usuario desactivado" });
    }

    // 5. Guardar en Redis para la PRÓXIMA petición
    // Guardamos solo lo necesario: id, username, role, preferences

    /*
    const sessionData = {
      id: user.id,
      username: user.username,
      role: user.role_name, // O como se llame en tu JOIN
      preferences: user.preferences,
    };

    await redis.set(
      `user:session:${userId}`,
      JSON.stringify(sessionData),
      "EX",
      3600, // Expira en 1 hora (opcional)
    );

    req.user = sessionData;*/

    req.user = await saveUserSession(user);

    next();
    //Tu checkRole no cambia casi nada. Él simplemente confía en lo que verifyToken le dejó en req.user. Si el admin cambió de rol y no es el mismo q está en token no pasa nada, xq se cargó en req.user.role el role que está en postgresql, el cual es el verdadero... y no podrá acceder a donde quiere ingresar si el rol no coincide, aunq el del token si lo sea.
    /*
    // 3. Guardar los datos decodificados (id, username, role)
    req.user = decoded; 

    next();*/
  } catch (error) {
    const expiredData = jwt.decode(token);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    if (error.name === "TokenExpiredError") {
      console.log("Token expirado");
      // 1. Extraer el ID aunque el token esté vencido (solo para limpiar)

      if (expiredData && expiredData.id) {
        deleteUserSession(expiredData.id);
        console.log(
          `Caché en Redis limpia para usuario ${expiredData.id} por token expirado`,
        );
      }

      return res.status(401).json({
        error: "TOKEN_EXPIRED", // <--- Mensaje clave para el Front. Es para mensajes personalizados solamente.
        message: "Tu sesión ha expirado",
      });
    } // Si el token expiró o fue manipulado
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
};

/*---¿Qué hacer con REDIS si el token expiró?---
Si el token de la cookie expiró, significa que el usuario ya no tiene permiso para entrar. Si dejas la sesión viva en Redis:
  - Basura en memoria: Estás ocupando espacio en tu contenedor de Docker con una sesión que nadie puede usar (porque el token que la "abre" ya no sirve).
  - Consistencia: Lo más limpio es que si el "ticket" (JWT) vence, el "asiento" (Redis) se libere.

--- El problema técnico (El ID)
Lo más limpio es que si el "ticket" (JWT) vence, el "asiento" (Redis) se libere. 
  - Pero cuando el JWT expira, jwt.verify() lanza un error y no te da los datos decodificados. 
  - Si no tienes el userId, no sabes qué llave borrar en Redis (user:session:???). 

--- ¿Cómo lo hacen los profesionales?
Hay dos caminos dependiendo de qué tanta importancia le des a la limpieza:
- Opción A: El camino simple (No borrar)
  Muchos desarrolladores simplemente dejan que la llave de Redis muera sola por el tiempo de expiración (TTL) que pusiste en el set (ej: 3600 segundos). Eventualmente, Redis la borrará automáticamente. Es lo más común si no quieres complicar el código.

- Opción B: El camino pro (Borrado proactivo)
  Para poder borrarla, necesitas el ID del usuario. Como el verify falló, tendrías que usar jwt.decode(token) (que extrae los datos sin validar la firma) solo para obtener el ID y limpiar Redis.
*/

/*¿res.clearCookie borra el acceso a token?
No. Es importante distinguir entre la Cookie (que está en el navegador del cliente) y la Variable (que está en la memoria de tu servidor Node.js).

  - req.cookies.token: Es una foto de lo que el cliente envió al principio de la petición.
  - res.clearCookie("token"): Es una instrucción que le dice al navegador: "Cuando recibas esta respuesta, borra esa cookie de tu disco".

Incluso si ejecutas res.clearCookie, la variable token que creaste al principio del middleware sigue conteniendo el string del JWT hasta que la función termine de ejecutarse.*/

/*---¿Por qué limpiar el Store (clearSession) si el token es "INVALID"?
Por seguridad y experiencia de usuario: Si el servidor dice 401 (por la razón que sea), significa que la "llave" que tiene el cliente no sirve. Por lo tanto, el cliente no debe fingir que está logueado. Limpiar el Store (clearSession) es la forma de decirle al Frontend: "Tu realidad local no coincide con la del servidor, vuelve al inicio".
Al hacer clearSession(), lo que borras es el recuerdo de React. La próxima vez que el usuario intente loguearse, el Backend enviará una nueva cookie válida que sobrescribirá a la inválida.

  - El usuario manipula su LocalStorage para ponerse role: 'admin'.
  - Tu Navbar muestra: "Panel de Control de Super Usuario". Luego hace una peticion al back y el servidor responde con: "401 Unauthorized".
  - Si tu Frontend no hace clearSession, el usuario se queda viendo un Panel de Admin que no funciona.
  - Al hacer clearSession, fuerzas a la interfaz a mostrar la realidad: "No tienes una sesión válida, por favor identifícate".

  - Si tú tienes una cookie llamada token que es inválida.
  - Y el servidor, al hacer login exitoso, responde con una nueva cookie con el mismo nombre TOKEN.
  - El navegador busca si ya existe una cookie llamada token. Como sí existe, simplemente borra el valor viejo y guarda el nuevo en el mismo "cajón".

---¿Qué pasa si el Token está "en el limbo"?
  - Si el token es inválido y mandas al usuario al Login:
  - La cookie sigue ahí: El navegador la guarda, pero como es inválida, el servidor la rechazará en cada intento.
  - El "Limbo" no afecta al Login: La ruta de /login no suele usar el middleware verifyToken. Por lo tanto, al servidor no le importa si envías una cookie basura; él simplemente procesará tus credenciales (user/pass) y, si son correctas, enviará la nueva llave maestra.

---¿Por qué es importante el res.clearCookie en el Logout?
Mencionaste antes que el logout del backend borra la cookie. Eso es para los casos donde el usuario elige irse.
  - Si el token venció: No puedes borrar la cookie desde el servidor fácilmente porque el verifyToken te bloquea el paso (como bien dijiste).
  - La solución: Simplemente dejamos que la cookie expire o que sea aplastada por el siguiente login exitoso.
*/

/*---Cuándo usar router.use(verifyToken)---
Es mejor cuando absolutamente todo lo que hay en ese archivo de rutas es privado.

Ejemplo (Perfil de Usuario): Todas las rutas relacionadas con /perfil (ver mis datos, cambiar mi foto, ver mis compras) requieren que estés logueado.

Ex:

// A partir de aquí, el muro está levantado 🧱
router.use(verifyToken); 

router.get("/mis-datos", getProfile); // PROTEGIDO 🔒
router.put("/editar", updateProfile); // PROTEGIDO 🔒
router.get("/seguridad", getLogs); // PROTEGIDO 🔒
*/

// Middleware Dinámico para Roles
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    console.log("DATOS DEL TOKEN EN REQ.USER:", req.user); // <--- MIRA ESTO
    console.log("ROLES PERMITIDOS:", allowedRoles);

    // 1. Verificar si el usuario existe (pasó por verifyToken)
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // 2. Comprobar si el rol del usuario está en la lista de permitidos
    // 'allowedRoles' puede ser un string "admin" o un array ["admin", "editor"]
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Intenta forzar minúsculas para evitar errores de tipeo
    const userRole = req.user.role?.toLowerCase();
    const hasPermission = roles.some((r) => r.toLowerCase() === userRole);

    if (!hasPermission) {
      return res.status(403).json({
        error: `Acceso denegado.`,
      });
    }
    // 3. Si todo está bien, adelante
    next();
  };
};
/* Ejemplo de uso de checkRole
// 1. Ruta que CUALQUIER usuario logueado puede ver
router.get("/profile", verifyToken, getProfile);

// 2. Ruta que SOLO un Admin puede usar
router.post("/create-user", verifyToken, checkRole("admin"), createUser);

// 3. Ruta que pueden usar Admins O Managers
router.get("/reports", verifyToken, checkRole(["admin", "manager"]), getReports);
*/
