import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // "Oye Node, busca el archivo .env y lee lo que tiene".

const { Pool } = pg; // Saca la herramienta 'Pool' de la librería.

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default pool;

/*Pool

El Pool es el estándar porque es automático y eficiente.
    - Gestión de colas: Si tu Pool tiene 10 conexiones y llegan 11 usuarios, el usuario 11 espera unos milisegundos en cola hasta que una conexión se libere.
    - Resiliencia: Si una conexión se muere, el Pool la detecta y crea una nueva.
    - Velocidad: Las conexiones ya están abiertas (calientes), por lo que la respuesta es casi instantánea.

Abrir una conexión a una base de datos es una de las tareas más "caras" y lentas en computación. Si tienes 10 usuarios haciendo clics al mismo tiempo, tu servidor gastaría más energía abriendo y cerrando puertas que entregando datos.

Imagina que la base de datos es un banco.

    - Sin Pool: Cada vez que un usuario pide algo, un empleado tiene que ir hasta la puerta, abrirla con llave, atender al cliente y volver a cerrar la puerta con llave. Esto es lentísimo si tienes 100 usuarios a la vez.

    - Con Pool: El banco deja la puerta abierta y tiene a 10 empleados (conexiones) sentados en sus puestos listos para atender. Cuando un usuario llega, usa un empleado que ya está "listo", y cuando termina, el empleado se queda ahí para el siguiente.

¿Por qué se exporta un pool? Porque quieres que toda tu aplicación comparta esa misma "piscina" de conexiones. No quieres crear una piscina nueva en cada archivo, sino usar siempre la misma que definiste en db.js.

---¿Cómo funciona por dentro?
En realidad, un Pool está lleno de varios Client. Cuando usas un Pool, la librería pg maneja los clientes por ti en segundo plano.

    - Si usas Client directamente: Tú eres el jefe de obra y tienes que llamar al trabajador, decirle que empiece, vigilarlo y, cuando termine, decirle que se vaya a casa. Si se te olvida despedirlo, te sigue cobrando (consume memoria y bloquea la base de datos).

    - Si usas Pool: Tú llamas a una agencia (el Pool). La agencia te presta un trabajador que ya está listo. Cuando terminas, el trabajador no se va a su casa, sino que vuelve a la agencia para esperar al siguiente cliente.

---¿Por qué existe Client entonces?
Aunque el 99% del tiempo usarás Pool, el Client se usa en casos muy específicos:

    - Transacciones complejas: Si necesitas asegurar que una serie de pasos (ej: cobrar dinero y luego actualizar inventario) ocurran en el mismo túnel de conexión sin interrupciones.

    - Operaciones únicas: Un script que se ejecuta una sola vez (como crear las tablas al instalar la app) y se apaga.

    - LISTEN/NOTIFY: Funciones de PostgreSQL en tiempo real que requieren una conexión fija y dedicada.
PROBAR A CREAR ESOS CASOS EN PRÁCTICA PARA VER SI POOL NO SIRVE PARA ELLO. CASOS DONDE DEBA SUAR CLIENT Y MANEJAR LOS TUNELES DIRECTAMENTE.
*/
