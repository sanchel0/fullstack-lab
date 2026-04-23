/*¿Cuándo debe ir en scripts/?
La carpeta scripts/ se usa para archivos que ejecutas manualmente desde la terminal una sola vez o de forma ocasional, no como parte del flujo automático de tu servidor.
    - Ejemplo: Un script para "hashear" una contraseña específica y pegarla a mano en tu base de datos (para crear un Admin inicial, por ejemplo).
    - Cómo se usa: node src/scripts/hashpassword.js.

Veredicto: Si ese archivo es una herramienta pequeña para ti, déjalo en scripts/.
*/

//Tareas de mantenimiento (limpiar DB, crear admin).
