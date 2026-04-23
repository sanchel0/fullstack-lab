/* ---Frontend Middleware---
Programar un try/catch con un if (401) en cada componente es una pesadilla de mantenimiento. Si mañana decides cambiar el código de error o el nombre de la función, tendrías que editar 50 archivos.

En el Frontend (React), la solución estándar para esto se llama Interceptors (si usas Axios) o un Wrapper Global (si usas Fetch). Es exactamente como un "middleware" pero para las respuestas que vienen del servidor.

Imagina que el Interceptor es un "Filtro de Seguridad" que está en la puerta de tu Frontend. Cada vez que llega una respuesta del servidor, el filtro la revisa: si dice 401, él mismo llama al Store, limpia al usuario y lo manda al Login, sin que el componente se entere.

Axios Instances es el estándar de la industria para proyectos profesionales, mientras que el Wrapper es una excelente solución "ligera" si quieres evitar librerías externas.

1. Axios Instances (La opción "Pro")
Es lo más potente porque los interceptores están diseñados específicamente para resolver este problema.

Ventajas:
    - Automático: No tienes que acordarte de usar una función especial; simplemente usas api.get() y el interceptor siempre está vigilando.
    - Manejo de Errores centralizado: Puedes configurar que todos los errores 500 muestren una alerta roja y que todos los 401 limpien el Store.
    - Transformación de datos: Puedes hacer que Axios convierta automáticamente las fechas de string a objetos Date de JS.
Desventajas: Añade unos pocos KB a tu proyecto (la librería Axios).

2. Wrapper Function (La opción "Limpia")
Consiste en crear tu propia función (ej: myFetch) que envuelve al fetch nativo.

Ventajas:
    - Sin dependencias: No instalas nada. Usas lo que el navegador ya trae.
    - Control total: Tú escribes cada línea de la lógica.
Desventajas:
    - Menos intuitivo: Tienes que manejar manualmente los "ReadableStreams" de fetch (hacer el .json()), lo cual puede ser tedioso.
    - Olvidos: Si un compañero de equipo usa window.fetch por error en lugar de tu myFetch, la seguridad (el 401) no se ejecutará.

¿Por qué es mejor esta arquitectura?
    - DRY (Don't Repeat Yourself): La lógica de "qué hacer cuando falla el token" vive en un solo lugar.
    - Desacoplamiento: Tus componentes solo se preocupan por mostrar datos. No necesitan saber cómo funciona la seguridad.
    - Consistencia: Si el token vence mientras el usuario está en el Perfil, en el Dashboard o en el Carrito, la app reaccionará exactamente igual en todos lados.
    - Punto Único de Verdad: Si mañana decides que el código de error para sesión expirada ya no es 401, sino 403, solo lo cambias en un archivo, no en 20 componentes.
    - Componentes Limpios: Tus componentes de React solo se preocupan por la lógica visual (pintar los datos). No necesitan "saber" nada sobre JWT o Redis.
*/
