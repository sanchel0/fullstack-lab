import winston from "winston";
import "dotenv/config"; // Esto carga todo lo que hay en el .env

// Configuramos cómo se verá el log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // Para que guarde el error completo con línea y archivo
  winston.format.json(), // Formato ideal para servidores
);

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    // 1. Guardar solo errores en un archivo
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // 2. Guardar todo (info, warn, error) en otro archivo
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Si estás en desarrollo, que también salga por la consola con colores
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}
//En Producción: Los console.log o mensajes por terminal pueden volver lento al servidor si hay miles de visitas. Además, en la nube nadie está mirando la terminal; los logs se leen desde archivos o paneles especiales.

export default logger;

/*¿Qué pasa si no hay entityId?
Es totalmente posible y normal. No todos los logs de información necesitan los mismos campos. Por ejemplo:
  - Login exitoso: Tienes userId, pero no hay un entityId de un recurso modificado.
  - Exportación de datos: Tienes userId y la acción export, pero quizás no un ID específico.

--- Regla de oro: Si el campo no aplica, simplemente no lo pongas. Winston es flexible; el JSON de un log puede tener 5 campos y el siguiente 10. No se va a romper.

Cuando tu código de log espera datos pero no los hay, tienes tres caminos estándar:

  - Omitirlo (Lo más limpio): Si no hay entityId, no lo pongas en el objeto. Winston generará un JSON sin esa clave. Las herramientas de búsqueda modernas manejan esto sin problemas.

  - Poner null o undefined: No es muy recomendado porque ensucia el log, pero sirve si quieres que todos tus logs tengan visualmente el mismo tamaño.

  - Usar un valor genérico: Como "N/A" (Not Applicable) o "system".

Simplemente omítelo. Si buscas por entityId, la herramienta te mostrará solo los que lo tienen.
*/

/*---¿Por cuánto tiempo durarán?
Con la configuración que tienes ahora: Para siempre.
Winston seguirá escribiendo en combined.log y error.log hasta que se acabe el espacio en tu disco duro. El archivo crecerá y crecerá (podría llegar a pesar GB).

---¿Cómo lo hacen las apps profesionales? (Log Rotation)
Nadie deja que un archivo crezca infinitamente. Se usa una técnica llamada Rotation. Cuando el archivo llega a cierto tamaño (ej. 10MB) o pasa un día, Winston lo "cierra", le pone la fecha al nombre, y crea uno nuevo.

Para hacer esto "nivel Pro", necesitas instalar este paquete:
  npm install winston-daily-rotate-file
Esto hará que se borren solitos después de 14 días y que no pesen más de 20MB cada uno.

import winston from "winston";
import "winston-daily-rotate-file"; // Importar el plugin

const transportCombined = new winston.transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',      // El archivo no pasará de 20MB
  maxFiles: '14d'      // Se borran automáticamente a los 14 días
});

const transportError = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d'      // Los errores los guardamos más tiempo (30 días)
});

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [transportError, transportCombined],
});
*/
