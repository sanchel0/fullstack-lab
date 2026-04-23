import { create } from "zustand";
import { persist } from "zustand/middleware";
//import { jwtDecode } from "jwt-decode";
import { logout as logoutService } from "../services/auth"; // Tu fetch con credentials: 'include'

// 1. La "Aduana": Verifica que el objeto tenga cara de usuario
const validateUser = (user) => {
  return (
    user &&
    typeof user.id === "number" &&
    typeof user.username === "string" /*&&
    typeof user.role === "string"*/
  );
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // Solo guardamos info visual
      isAuthenticated: false,

      // El backend hizo el trabajo sucio y guardó la cookie
      // Nosotros solo guardamos lo que el JSON nos envió para la interfaz
      login: (userData) => {
        if (validateUser(userData)) {
          set({
            user: userData,
            isAuthenticated: true,
          });
        }
      },

      // El store centraliza la lógica de logout
      logout: async () => {
        try {
          await logoutService(); // 1. Le pide al back que borre la cookie
        } catch (error) {
          console.error("Error al avisar al backend del logout", error);
        } finally {
          // 2. PASE LO QUE PASE, limpiamos el estado local (seguridad ante todo)
          set({ user: null, isAuthenticated: false });
          // Opcional: limpiar otros estados globales si los tuvieras
        }
      },

      //Aunque clearSession está bien, en muchos equipos a ese método le llaman forceLogout o onAuthFailure, para indicar que no es algo que el usuario quiso, sino algo que "pasó".
      clearSession: () => {
        // Aquí NO llamamos a la API, porque sabemos que dará error
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "user-data-storage", // Solo datos de interfaz
    },
  ),
);

/* ---xq store llama a la api logout y no en el componente?
  - Si mañana decides que el logout también debe borrar el carrito de compras o un historial, solo cambias el Store. El botón del Navbar no se entera de los detalles técnicos.
  - Al usar finally en el Store, te aseguras de que aunque el servidor esté caído (error 500), el usuario quede deslogueado en su navegador. No querrías que alguien se quede "atrapado" en su sesión porque el servidor falló.
  - Reactividad: Como el Navbar "escucha" a isAuthenticated, en cuanto el método logout hace el set({ isAuthenticated: false }), el botón de cerrar sesión desaparece automáticamente y aparece el de login sin que tengas que recargar la página.
*/

/*export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Acción de Login: Ahora recibe el TOKEN, no el objeto usuario
      login: (token) => {
        try {
          const decoded = jwtDecode(token);

          // Extraemos los datos (Claims) que definimos en el Backend
          const userData = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role || "user", // Valor por defecto por seguridad
          };

          if (validateUser(userData)) {
            set({
              token,
              user: userData,
              isAuthenticated: true,
            });
          } else {
            console.error("El token no contiene los datos necesarios");
            set({ user: null, token: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("Token inválido o malformado" + error);
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage", // Nombre en LocalStorage
    },
  ),
);
*/

/*---Guardar el token en localStorage no es "incorrecto" (muchas apps lo hacen), pero NO es la mejor práctica de seguridad.---

Si quieres hacer las cosas al máximo nivel de seguridad (como lo haría una entidad bancaria o una empresa de tecnología seria), deberías separar el Token de los Datos.

--La recomendación actual es:
    - El Token: Debe viajar en una Cookie HttpOnly.
    - Los Datos (User): Pueden vivir en Zustand (localStorage).
*/
