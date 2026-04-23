import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import {
  saveUserSession,
  deleteUserSession,
} from "../services/session.service.js";
import { ROLES } from "../utils/constants.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  console.log("Datos recibidos:", req.body);

  try {
    // 1. Usar el modelo para buscar al usuario
    // (Tendrías que crear el método findByEmail en tu UserModel)
    const user = await UserModel.findByUsername(username);

    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    // 2. Verificar contraseña (comparar plana vs hash)
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // 3. GENERAR EL TOKEN (Aquí nace el token)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      "TU_CLAVE_SECRETA_SUPER_SEGURA",
      { expiresIn: "5m" },
    );
    console.log("User: " + user.username + " - Token: " + token);

    // RE-CARGAR REDIS (Opcional pero recomendado para velocidad). Usamos el servicio para no repetir código
    const sessionData = await saveUserSession(user);

    // ENVIAR COOKIE HTTPONLY
    res.cookie("token", token, {
      httpOnly: true, // No accesible desde JS (Previene XSS)
      secure: true, // Si no tienes certificado SSL (HTTPS), la cookie nunca se guardará
      sameSite: "none", // -None: La cookie se envía siempre, sin importar de dónde venga la petición. -Lax: La cookie no se envía en peticiones hechas por otros sitios.
      maxAge: 24 * 60 * 60 * 1000, // 24 horas. Si el usuario cierra el navegador y lo abre mañana, seguirá logueado
    });

    // 4. Enviar respuesta
    res.json({
      message: "Login exitoso",
      //token, // <--- Si estás usando Cookies HttpOnly, el token ya no debe viajar en el JSON. Si lo pones en el res.json, el Frontend lo recibirá y tendrá acceso a él mediante JavaScript. Esto anularía el propósito de usar httpOnly: true, ya que el objetivo de esa cookie es que el token sea invisible para el código JavaScript y así estar protegido contra ataques XSS.
      user: sessionData,
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el login" });
  }
};

/*---¿Por qué el login debe tener el res.cookie?---
  - Sin el código en index.js: El navegador vería la cookie llegar, pero diría: "El servidor no me dio permiso explícito para guardar credenciales, así que la ignoro".
  - Sin el res.cookie en el login: El servidor da permiso, pero nunca entrega nada. El usuario se loguea, pero no recibe su llave (token) para entrar después.
  - Solo se envía en el login. Una vez que el navegador recibe esa cookie en el login, la guarda en su "caja fuerte" interna. A partir de ese momento, en cada petición futura que el frontend haga (usando credentials: "include"), el navegador pegará esa cookie automáticamente sin que tú hagas nada más en el backend.
  - Logout: Aquí usas res.clearCookie("token") para destruirla. Pero en los demás métodos de controladores, no se hace nada relacionado con cookies, solo Login y Logout methods.
*/

export const register = async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;

  try {
    // 1. Encriptar la contraseña
    const saltRounds = 10; // Nivel de seguridad
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 2. Llamar al modelo pasando el HASH, no la password plana
    const newUser = await UserModel.create({
      username,
      email,
      password_hash: passwordHash, // <--- Aquí pasamos el secreto encriptado
      first_name,
      last_name,
      role: ROLES.USER, // <--- Mucho más claro que poner un "2", ya q puede cambiar en el futuro y además es más intuitivo. No importa si el hacker envió {role: 'admin'}, aquí lo fuerzas a user.
    });

    res.status(201).json({
      message: "¡Bienvenido! Cuenta creada. Inicia sesión.",
      user: { username: newUser.username },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrarse." });
  }
};

export const logout = async (req, res) => {
  //res.clearCookie("token");
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none", // Mantener igual que en el login
    // path: "/" (Si en el login definiste un path, aquí también debe ir)
  });
  const expiredData = jwt.decode(req.cookies.token);
  deleteUserSession(expiredData.id);
  res.json({ message: "Sesión cerrada correctamente" });
};

/* ---¿Alguien puede "desencriptar" mi clave secreta? - NO---
La clave secreta (tu TU_CLAVE_SECRETA_SUPER_SEGURA) nunca viaja en el token. El token se genera usando esa clave mediante un proceso matemático llamado Hashing (HMAC SHA256).

---¿El backend guarda el token para comparar?
No, y esa es la magia de los JWT (Stateless).
El backend no necesita guardar nada en una base de datos ni en memoria temporal para saber si un token es válido.

---Cuando el backend recibe un token:
  - Toma el header y el payload (los datos del usuario) que vienen en el token.
  - Agarra su clave secreta (que solo él conoce y está guardada en sus variables de entorno).
  - Vuelve a hacer el cálculo matemático.
  - Si el resultado de ese cálculo es idéntico a la "firma" que el usuario envió en el token, entonces el token es legal.

Si un usuario cambia su ID de 1 a 99 en el token, el cálculo matemático del backend dará un resultado distinto a la firma enviada, y el backend responderá: "401 Unauthorized: Firma inválida".

---¿Qué pasa si alguien "roba" el token?
Aquí sí tienes razón en preocuparte. Si alguien copia el token entero de la computadora de la víctima (un ataque llamado Session Hijacking), sí podría usarlo para hacerse pasar por ella.

Por eso existen estas medidas de seguridad:

  - expiresIn: "5m" o "1h": El token tiene fecha de caducidad. Si alguien lo roba, solo le servirá por un tiempo muy corto.

  - HTTPS: Los tokens siempre deben viajar por conexiones cifradas (SSL) para que nadie pueda "escucharlos" en la red (ej. en un Wi-Fi público).

  - HttpOnly Cookies: (Opcional) En lugar de LocalStorage, puedes guardar el token en una cookie que el JavaScript no pueda leer, lo que evita que virus (scripts maliciosos) lo roben.


---Cuando el servidor responde con una cookie HttpOnly, le está dando una orden directa al navegador (Chrome, Safari, Firefox):
  - "Guarda este token, pero prohíbe que cualquier código JavaScript (incluyendo React, Zustand o un Hacker) lo vea o lo toque".
  - ¿Se guardan los datos? Sí, en el navegador.
  - ¿Puede acceder JS? No. Si escribes document.cookie en la consola, el token no aparecerá.
  - ¿Cómo se envían al Backend? El navegador, de forma automática, adjunta esa cookie en cada petición que hagas a tu API. Tú no tienes que programar nada para que el token viaje.

--Si Zustand no puede ver el token, ¿cómo sabe quién es el usuario? Aquí es donde separamos Seguridad de Interfaz:
  - El Token (Seguridad): Vive en la Cookie HttpOnly. Solo el navegador y el servidor lo conocen. Sirve para que el Backend te deje entrar a la base de datos.
  - Los Datos del Usuario (Interfaz): (Username, Rol, ID). Estos SÍ los guardamos en Zustand. El Backend te los manda en el cuerpo del JSON (como ya lo hacías) durante el login.

---La solución "Cero Paranoia": Server-Side Rendering (SSR)
Si realmente te preocupa que el código de la página de Admin siquiera llegue al navegador de un usuario normal, la solución no es React puro (SPA), sino usar Next.js.
  - Con Next.js, el servidor revisa la cookie antes de enviar el HTML al navegador.
  - Si no eres admin, el servidor ni siquiera te manda el código JS de la página de administración. Directamente te manda un error 404 o un redireccionamiento desde el servidor.
  - Maneja los errores 403: Si el backend responde 403, haz que tu frontend borre la sesión y mande al usuario a una página de "No autorizado".
  - Protege visualmente con Zustand: Para que los usuarios normales tengan una buena experiencia.
  - Usa Cookies HttpOnly: Para que no puedan robar el "boleto" (token).
  - Protege REALMENTE en el Backend: Asegúrate de que cada ruta de tu API (/api/users, /api/delete, etc.) verifique el rol del token.
*/

/*
//Transformando tu Backend a Cookies HttpOnly: Para usar esta capa de seguridad, primero instala cookie-parser en tu backend: npm install cookie-parser

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findByUsername(username);
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: "Credenciales inválidas" });

    // 1. Generamos el token igual que antes (pero añade el ROLE)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      "TU_CLAVE_SECRETA_SUPER_SEGURA",
      { expiresIn: "1h" }
    );

    // 2. ENVIAR COMO COOKIE HTTPONLY (Aquí está la seguridad)
    res.cookie("auth_token", token, {
      httpOnly: true, // El JavaScript NO puede leer esta cookie (Adiós XSS)
      secure: process.env.NODE_ENV === "production", // Solo se envía por HTTPS en producción
      sameSite: "strict", // Evita ataques CSRF
      maxAge: 3600000, // 1 hora en milisegundos
    });

    // 3. Respondemos con los datos del usuario, pero SIN el token
    res.json({
      message: "Login exitoso",
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el login" });
  }
};
*/
