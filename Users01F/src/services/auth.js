const API_URL = "https://localhost:3000/api"; // Cambia al puerto de tu servidor
import api from "./api";

/*export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      credentials: "include", // <--- Obligatorio para validar que eres Admin
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createUser api:", error);
    throw error;
  }
};*/

//Al usar tu instancia api.js, el código se reduce drásticamente porque ya no tienes que configurar manualmente los headers, las credenciales, ni convertir el body a string. No hace falta poner withCredentials en cada llamada, ya que se configuró en api.js axios.
export const createUser = async (userData) => {
  try {
    // 1. No indicas 'method', usas la función .post()
    // 2. No pasas la URL completa, solo el endpoint
    // 3. No usas JSON.stringify, pasas el objeto directo
    const response = await api.post("/users", userData);

    // Axios ya verificó si response.ok era true.
    // Si el status es 4xx o 5xx, salta directamente al catch.
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Error al crear usuario";
    console.error("Error en createUser:", message);
    throw new Error(message);
  }
};

//¿Está bien tener withCredentials: true siempre? Está perfectamente bien y es lo más cómodo. En Register: Si no hay cookies, simplemente no se envía nada extra. No rompe la petición ni la hace más lenta. Al dejarlo en true por defecto en la instancia de Axios, te olvidas de ese problema para siempre. No tienes que estar recordando en qué peticiones ponerlo y en cuáles no.
export const register = async (userData) => {
  try {
    // Apuntamos a /api/auth/register en lugar de /api/users
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Usamos el mensaje que viene del backend o uno por defecto
      throw new Error(errorData.error || "Error al registrarse");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en register api:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      credentials: "include", // <--- Obligatorio para leer la cookie de sesión
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Creamos un error que contenga el código que manda el backend
      const error = new Error(errorData.message || "Error de sesión");
      error.code = errorData.error; // Aquí guardamos "TOKEN_EXPIRED" o similar
      error.status = response.status;
      throw error;
      //throw new Error("No se pudo obtener el perfil." + errorData.error);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getProfile api:", error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      // Ajusta la ruta según tu API
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Credenciales inválidas");
    }

    return await response.json(); // Debería traer { token, user }
  } catch (error) {
    console.error("Error en login api:", error);
    throw error;
  }
};

//---

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 401 || response.status === 403) {
      // Si el token venció o es inválido, podrías limpiar el localStorage aquí
      throw new Error("Sesión expirada");
    }
    if (!response.ok) {
      throw new Error("Error al obtener la lista de usuarios");
    }

    return await response.json(); // Retorna el array de usuarios
  } catch (error) {
    console.error("Error en getUsers api:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "GET",
      credentials: "include", // Clave para cookies HttpOnly
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Usuario no encontrado");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en getUserById (${id}) api:`, error);
    throw error;
  }
};

export const updateProfile = (data) => putRequest("/users/me", data);

export const adminUpdateUser = async (id, data) => {
  try {
    return await putRequest(`/users/${id}`, data);
  } catch (err) {
    // Si quieres un error súper específico para el Admin:
    throw new Error(`Error crítico al editar usuario: ${err.message}`); //Aquí es donde decides si quieres añadir un mensaje personalizado o simplemente dejar que el error del "Motor" fluya.
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

const putRequest = async (endpoint, data) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Intentamos sacar el mensaje del backend, si no, uno genérico
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.message || "Error en la operación",
    ); //Para los errores, lo más limpio es que el genérico lance el error que viene del backend, ya que el backend suele ser específico (ej: "El stock no es suficiente" o "El email ya existe").
  }

  return await response.json();
};
/*---¿Por qué hace falta llamar al backend para LOGOUT?---
Como la cookie es HttpOnly, tu código de React no puede hacer document.cookie = "token=; expires=...". La única forma de borrar esa cookie es que el servidor responda con un encabezado especial (Set-Cookie) que le diga al navegador: "Oye, esta cookie ya expiró, bórrala ahora mismo". Osea aunq no haya vencido todavía, el backend modifica esa cookie token para que parezca que venció hace mucho tiempo.

El frontend no puede tocar la cookie, así que le pide el favor al backend. Cuando tú ejecutas res.clearCookie('nombre') en el backend, no estás borrando un archivo mágicamente a distancia. Lo que el backend hace es enviar una respuesta al navegador con una cabecera Set-Cookie que dice algo como esto:
  Set-Cookie: token=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT

Por estándar de seguridad, en cuanto un navegador detecta que una cookie ha expirado, la elimina físicamente de su memoria y del disco duro de forma inmediata. Los navegadores están programados para ser "limpios". Guardar cookies vencidas sería un desperdicio de espacio y un riesgo de seguridad.

¿Qué pasa si NO llamas al backend?
El archivo de la cookie permanece en el almacenamiento del navegador (Chrome, Safari, etc.) hasta que venza por tiempo (pueden ser horas o días). Si alguien más usa esa computadora y entra a tu web, aunque React diga "no hay usuario", en cuanto esa persona haga una acción que dispare un fetch, el navegador enviará la cookie vieja automáticamente porque todavía existe. El backend la verá válida y le dará acceso a los datos.
*/

/*
Creas un AuthContext que envuelve a toda tu app.
El "AuthContext" + Custom Hook
Si solo lo guardas en el Login.jsx, otros componentes (como el Navbar para mostrar tu nombre) no se enterarán de que te logueaste a menos que recargues la página.

Lo más estándar es crear un AuthContext. Aquí te explico la lógica:

Estado Global: Creas un archivo que guarda el usuario en un estado (user, setUser).

Persistencia: Ese mismo archivo se encarga de leer el localStorage cuando abres la web.

import { createContext, useContext, useState } from 'react';
import { login as loginService } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const data = await loginService(credentials); // Llama a tu service
    localStorage.setItem('token', data.token);    // Guarda el token
    setUser(data.user);                           // Guarda al usuario en memoria
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Este es el Hook que usarás en tus componentes
export const useAuth = () => useContext(AuthContext);
*/
