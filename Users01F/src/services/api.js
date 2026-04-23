import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

//---¿Por qué el prefijo VITE_?--- Vite exige por seguridad que todas las variables que quieras usar en el Frontend empiecen con VITE_. Si creas una variable que se llame solo API_URL, Vite la ignorará y no la podrás leer en tu JS. Esto es para evitar que, por error, expongas claves secretas (como una Key de base de datos) en el navegador del cliente.
//Cuando ejecutas el comando de construcción para subir a internet, él busca el archivo .env que termina en .production y reemplaza automáticamente el valor. Tú no tienes que hacer nada en el JSON ni en el código.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Vite lo carga automáticamente
  withCredentials: true, // ¡IMPORTANTE para que envíe las cookies!
});
// Si usas Axios, puedes crear una instancia centralizada que "escuche" todas las respuestas. Si ve un 401, dispara el clearSession de Zustand automáticamente.

// Cuando la respuesta llega del servidor, Axios detecta el encabezado Content-Type: application/json. Si lo ve, automáticamente transforma el texto plano en un objeto de JavaScript antes de que la respuesta llegue a tu interceptor o a tu try/catch. La respuesta ya es el objeto procesado. Está listo en response.data.

// Si quisieras, podrías incluso "limpiar" la respuesta ahí mismo para no tener que escribir .data en tus componentes, haciendo "return response.data;". Pero la mayoría de los desarrolladores prefieren devolver response (el objeto completo) para tener acceso al status (200, 201) si lo necesitan en el componente.

// INTERCEPTOR DE RESPUESTA (El "Middleware" del Front)
api.interceptors.response.use(
  (response) => response, // Si todo sale bien, deja pasar la respuesta
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada detectada por Interceptor");

      // Accedemos al Store de Zustand y ejecutamos la limpieza
      useAuthStore.getState().clearSession();

      // Opcional: Redirigir al login si no estás ahí
      //window.location.href = "/login"; //Problema: Esto recarga toda la página (pierdes el estado de la app). Es como darle F5 al navegador. No es la experiencia suave que queremos en React.
      //---Solución: Tienes una ruta protegida que dice: "Si isAuthenticated es false, muéstrame el Login". Quizás en ProtectedRoutes u otro lugar que haga esa lógica. Si estás en un lugar que no requiere login, entonces no te redirije, pero si es una ruta protegida si te saca y te manda a login o que no tienes acceso.
    }
    return Promise.reject(error);
  },
);

export default api;

/*---¿Usar api.js (Axios) en vez de llamar directamente a fetch en los demás archivos de services dirigidos a un server en específico?---
Lo ideal es que unifiques todo en api.js con Axios. Tener fetch en un archivo y axios en otro es confuso y te obliga a configurar las cosas dos veces.

---Debes usarla en todos tus archivos de services/ (auth.js, user.js, products.js) siempre que la petición vaya dirigida a tu backend.

El Interceptor: Si el token vence mientras pides la lista de productos, el api.js lo detecta y limpia la sesión. Si usaras fetch directo en products.js, el usuario vería un error de "No autorizado" pero seguiría apareciendo como "Logueado" en tu interfaz de React (Zustand).

La mejor práctica:
  - Define la URL base en tu instancia de Axios (api.js).
  - Importa esa instancia api en tus otros servicios (como user.service.js).

---Cuándo usar fetch directo (o crear otra instancia)
Si necesitas pedir datos a un servidor que no es el tuyo (ejemplo: la API de Google Maps, una API de clima, o PokeAPI).

--¿Por qué NO usar api.js para esto?
    - Seguridad: Tu api.js está configurado para enviar cookies (withCredentials: true). Si envías esas cookies a la API del Clima, podrías estar exponiendo información innecesariamente.
    - Interceptores: No quieres que si la API del Clima te da un error, se te cierre la sesión de tu propia app. No tienen nada que ver.
--Qué hacer en esos casos:
    - Si es una petición única: Usa fetch directamente en el service.
    - Si vas a consultar mucho esa otra API: Crea un archivo apiExterna.js con una nueva instancia de Axios que no tenga interceptores de sesión.

---Un último consejo de "limpieza"
Ahora que tienes Axios, recuerda que Axios ya hace el .json() por ti.
    - Con Fetch: Tenías que hacer const data = await res.json().
    - Con Axios: La respuesta ya viene en response.data. ¡Es mucho más cómodo!
*/
