/*¿Cuándo debe ir en utils/? (Lo más común)
Si tu archivo contiene la lógica que usa tu auth.controller.js para encriptar la contraseña cuando un usuario se registra.
    - Ejemplo: Una función hashPassword(plainText) que exportas para usarla en el registro.
    - Por qué: Porque "hashear" es una utilidad técnica (como el logger) que no depende de las reglas de tu negocio, sino que es una herramienta de seguridad general.

Veredicto: Si lo importas en tus controladores, muévelo a utils/password.util.js.
*/

//Herramientas genéricas (encriptar, formatear fechas).
