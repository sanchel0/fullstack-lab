//---Logs---

/*¿Se guardan en la DB principal?
¡NUNCA! (Bueno, casi nunca).
Si guardas logs en tu tabla de PostgreSQL, cada vez que un usuario haga algo, estarás escribiendo en la base de datos. Si tienes muchos usuarios, la base de datos se volverá lenta solo por anotar logs.
    - Transportes de archivos: Tu app escribe en un archivo .log en el servidor. Un programa aparte (llamado Log Shipper) lee ese archivo y lo manda a una base de datos especializada en logs (NoSQL o Time-series como ElasticSearch o Loki).
    - SaaS: Envías los logs directamente por HTTP a una plataforma externa (Sentry para errores, Loggly para eventos).
*/
/*¿Los Logs se guardan para siempre o se borran?
No se guardan para siempre. Guardar logs de años ocuparía terabytes de espacio innecesario y costaría mucho dinero. Las apps profesionales usan una Política de Retención:

Logs "Hot" (Calientes): Se guardan los últimos 7 a 30 días. Están indexados y puedes buscarlos al instante (en servicios como Datadog o ElasticSearch). Sirven para arreglar bugs actuales.

Logs "Cold" (Fríos/Archivo): Después de 30 días, se comprimen y se mueven a un almacenamiento muy barato (como AWS S3). Se guardan de 1 a 5 años solo por temas legales o auditorías. Luego, se borran automáticamente.
*/
/*Morgan vs. Winston: ¿Quién hace qué?
Morgan (El Recepcionista): Es un middleware. Su única función es registrar peticiones HTTP.
    - Qué anota: "Llegó un GET a /users, devolví un 200, tardó 5ms".
    - Ventaja: Es automático. No tienes que escribir nada en tus controladores.
Winston (El Escribano): Es una librería de logging genérica. Sirve para anotar eventos de negocio y errores internos.
    - Qué anota: "El Admin 5 borró al Usuario 10", o "Error: La base de datos no respondió".
    - Ventaja: Tú controlas qué, cuándo y cómo se guarda la información.
*/

/*¿Es estándar poner logs en cada try/catch?
No. Si pones un logger.error en cada catch de tu app, vas a terminar con un código sucio y repetitivo. La estrategia profesional es:
    - Logs de Negocio (Manuales): Solo pones logger.info para acciones críticas (crear usuario, borrar producto, cambio de clave).
    - Logs de Error (Automáticos): Creas un Middleware de Error Global al final de todas tus rutas.

Middleware de Error:
- En el controlador
    try {
    // lógica...
    } catch (error) {
    next(error); // <--- Esto envía el error al "Gran Logger de Errores" automáticamente
    }
- Luego, al final de tu archivo app.js, tienes este middleware:
    app.use((err, req, res, next) => {
    // AQUÍ se registra el error una sola vez para toda la app
    logger.error(`${req.method} ${req.url} - ${err.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
    });
*/
/*¿Qué significa el 500?
El código 500 (Internal Server Error) es el "comodín" del servidor: significa que algo salió mal y el servidor no supo cómo manejarlo elegantemente. El 500 debe reservarse únicamente para errores inesperados del sistema:
    - La base de datos se desconectó.
    - Intentaste leer una propiedad de algo que es undefined (error de código).
    - Un servicio externo (como una API de pagos) dejó de responder.
    - Regla de oro: Si el error es culpa de la infraestructura o de un bug en tu código, es 500.

--- ¿Qué pasa con las Reglas de Negocio?
Aquí es donde NO debes usar 500. Si el usuario intenta hacer algo que no está permitido, el servidor está funcionando perfectamente (está aplicando las reglas). Debes usar códigos de la familia 400:
    - 400 (Bad Request): Error de validación (Zod detectó que falta el email).
    - 401 (Unauthorized): El token no es válido o expiró.
    - 403 (Forbidden): El token es válido, pero el usuario no tiene permisos (ej: un "User" intentando entrar a una ruta de "Admin").
    - 404 (Not Found): El ID del usuario que quieres editar no existe.
    - 409 (Conflict): El email ya existe en la base de datos.
*/
/*El formato del mensaje: ¿Frases o Data?
Tienes toda la razón: Las frases son para humanos, la data es para máquinas. En una app profesional, los logs se guardan en formato JSON. Esto permite que después puedas buscar en un panel (como Datadog o Kibana) todos los logs donde action === "update".

- Mal (Difícil de procesar):
    logger.info("El usuario 5 actualizó el producto 10")
*/

/*¿Por qué se mezclan los Logs de Winston y Morgan en un solo archivo?
El archivo combined.log no es para que un humano lo lea de arriba a abajo como una novela. Se mezclan porque representan la línea de tiempo real del servidor.

Si a las 10:05:02 hubo un error, quieres ver qué pasó justo antes (el log de Morgan) y qué intentaba hacer el usuario (el log de Info). Si estuvieran en archivos separados, tendrías que estar abriendo dos ventanas y comparando los milisegundos para entender qué pasó.
     -Línea de Morgan: "Alguien hizo un PATCH a /api/users/45 y le devolví un 200". (Automático).
    - Línea de Winston: "El usuario Admin con ID 1 actualizó al Usuario 45". (Manual/Negocio).

Diferentes audiencias:
    - Los logs de Morgan le interesan al administrador de sistemas (para ver si el servidor está lento o si hay muchos errores 404).
    - Los logs de Winston le interesan al dueño del negocio o al auditor (para saber quién cambió un precio o borró un cliente).

---¿Qué se hace después con ese archivo? (El secreto profesional)
Nadie abre un archivo de 2GB con el Bloc de Notas. Las empresas usan herramientas llamadas Log Analyzers (como ElasticSearch, Datadog o Grafana Loki).

Estas herramientas "se tragan" tu archivo combined.log y, como todo es JSON, te permiten hacer esto:
    - Filtrar: "Muéstrame solo los logs donde action sea update".
    - Alertar: "Si aparece un log con level: error más de 5 veces en un minuto, mándame un mensaje a Slack".
    - Graficar: "Hazme un gráfico de cuántos usuarios actualizaron su perfil hoy".
*/

/*¿Qué guardar en el Cache del Navegador (Client-Side)?
El caché del navegador es ideal para reducir el tráfico de red y hacer que la web cargue instantáneamente en la segunda visita.

SÍ guardar:
    - Recursos Estáticos: Imágenes (logos), fuentes (TTF/WOFF), archivos CSS y JS de la librería (React, Vue, Tailwind). Estos casi nunca cambian.
    - Configuraciones del Usuario: Preferencias de modo oscuro/claro, idioma seleccionado.
    - Datos de "Catálogo": Listas que no cambian en todo el día (ej. la lista de países, categorías de productos, o unidades de medida).

NO guardar:
    - Datos Sensibles: Tokens de sesión (mejor en Cookies HttpOnly), números de tarjeta, información médica o saldos bancarios.
    - Datos en Tiempo Real: Precios de acciones, criptomonedas o el inventario exacto de un producto que se agota rápido.
*/
