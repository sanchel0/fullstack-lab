/* En la arquitectura de Node.js hay una regla de oro: ---"Un Middleware no debe llamar a un Controller."---
---La solución: El Servicio es el "dueño" de la lógica
La lógica de borrar la sesión en Redis y limpiar la cookie no pertenece ni al middleware ni al controller; pertenece a la capa de servicios.

Como ya creaste deleteUserSession en tu session.service.js, lo ideal es que ambos (Middleware y Controller) lo usen. Llamar a la misma función desde dos sitios no es duplicar código, es reutilizar una herramienta.
*/

/*El usuario puede salir por la puerta (Logout) o lo pueden echar porque se le terminó el tiempo (Expiración).

- Escenario 1: El usuario hace clic en "Cerrar Sesión" (Manual)
Este es el camino feliz. El usuario decide irse y da click en el botón Logout del front.
    - Frontend: Se ejecuta authStore.logout().
    - Frontend: Este llama a logoutService() (el fetch al backend).
    - Backend: Entra al auth.controller.js -> método logout.
    - Backend: Ahí ejecutas await deleteUserSession(id) y res.clearCookie("token").
    - Frontend: Una vez que el backend responde "OK", el Store de Zustand borra el user: null.

- Escenario 2: El token vence mientras el usuario navega (Automático)
Aquí es donde entra tu verifyToken (el Middleware). El usuario intenta entrar a /profile, pero su token ya no sirve.
    - Backend: El middleware verifyToken intenta validar el JWT y falla (lanzando el error TokenExpiredError).
    - Backend: En el catch del middleware, tú mismo haces la limpieza: await deleteUserSession(id) y res.clearCookie("token").
    - Backend: Respondes un status 401 con el error "TOKEN_EXPIRED".
    - Frontend: Tu componente Profile.jsx recibe ese 401.
    - Frontend: Se ejecuta if (error.status === 401) clearSession();.
    - Zustand: Simplemente borra el estado local (user: null). No hace falta llamar al backend porque el backend ya se limpió a sí mismo en el paso 2.

No llamar a la API en clearSession del authStore es brillante por dos razones:
    - Evitas bucles infinitos: Si llamaras a logout (que pide token) cuando el token ya falló, el backend te daría otro 401, y el front intentaría desloguear otra vez... un desastre.
    - Ahorras recursos: Si el servidor ya te dijo que no eres válido (401), es obvio que él ya tomó las medidas necesarias.

Un detalle técnico final:
    - Cuando el Backend hace res.clearCookie("token") en el catch del middleware, el navegador borra la cookie en el momento que recibe la respuesta 401.
    - Por lo tanto, para cuando tu código de React ejecuta clearSession(), la cookie ya ni siquiera existe en el navegador. La sincronización es perfecta.


*/
