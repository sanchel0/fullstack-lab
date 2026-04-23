import pool from "../config/db.js";

class UserModel {
  // Método explícito: solo acepta lo que definimos aquí
  static async create({
    username,
    email,
    password_hash,
    first_name,
    last_name,
    role,
  }) {
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name, role_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    // Los valores se pasan en un array para evitar Inyección SQL
    const values = [
      username,
      email,
      password_hash,
      first_name,
      last_name,
      role,
    ];

    try {
      const { rows } = await pool.query(query, values);
      return rows[0]; // Retorna el usuario recién creado (incluyendo su ID y timestamps)
    } catch (error) {
      // Aquí puedes manejar errores específicos (ej: email duplicado)
      throw error;
    }
  }

  static async update(id, data) {
    //SQL Dinámico
    const keys = Object.keys(data); // ['username', 'email']
    if (keys.length === 0) return null;

    // Construimos la parte "SET username=$1, email=$2" dinámicamente
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const values = Object.values(data);
    const query = `
    UPDATE users 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${keys.length + 1} 
    RETURNING *;
  `;

    // Añadimos el ID al final del array de valores para el WHERE
    const { rows } = await pool.query(query, [...values, id]); //rows solo contiene la fila (o filas) que fueron afectadas por el comando SQL actual, no toda la tabla de la base de datos.
    return rows[0]; //Tomamos el primer elemento del array.
  }
  /*static async update(id, data) {
    const { username, email, first_name, last_name, role_id } = data;

    const query = `
      UPDATE users 
      SET username = $1, email = $2, first_name = $3, last_name = $4, role_id = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      username,
      email,
      first_name,
      last_name,
      role_id,
      id,
    ]);
    return rows[0];
  }*/

  static async findAll() {
    const query = `
    SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id;
  `;
    const { rows } = await pool.query(query);
    return rows;
  }
  //---¿Por qué no usar siempre SELECT *?--- Seguridad: Evitas enviar datos que el cliente no necesita (como la contraseña en un findAll). Si mañana agregas una columna que guarde un PDF o un texto larguísimo, el SELECT * traerá todo eso y hará la app lenta.
  /*¿Debe devolver role_name y role_id el Backend en findAll de user.model?
    - role_name: Para mostrarlo en la tabla (lo que el humano lee).
    - role_id: Porque si le das al botón "Editar", necesitas saber qué ID tiene actualmente para marcarlo como seleccionado en el combobox.
    - Cuando le das al botón Modificar en tu tabla de usuarios: ya tienes el role_id actual: Porque lo incluiste en el findAll. 
    - Llamas a getAllRoles (de tu nuevo servicio role.js) para llenar el combobox de la ventana de edición con todas las opciones disponibles.
    - Pre-seleccionas: En el <select>, marcas como activo el que coincida con el role_id que ya tenías del usuario.
  */
  static async findByUsername(username) {
    const query = `
    SELECT u.*, r.name as role 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.username = $1;
  `;
    try {
      const { rows } = await pool.query(query, [username]);
      return rows[0]; // Retorna el usuario o undefined
    } catch (error) {
      throw error;
    }
  }
  /*¿Por qué el JOIN gana frente a llamar a dos modelos por separado?
    - Con JOIN: Haces una sola petición a la base de datos. El motor de PostgreSQL (que es extremadamente rápido para esto) junta las piezas y te entrega el resultado listo.
    - Con dos modelos: Si tienes una lista de 50 usuarios y quieres mostrar sus roles, tendrías que hacer 1 consulta para los usuarios y luego 50 consultas extras (una por cada usuario) para buscar el nombre del rol. Esto se conoce como el problema de "N+1" y puede hacer que tu app sea muy lenta.
    - El controlador debe ser "tonto"; su única tarea es recibir la petición y enviar la respuesta. Si haces el JOIN en el modelo, el controlador solo recibe un objeto limpio: { username: 'juan', role: 'admin' }. Si no haces el JOIN, tu controlador tendría que estar "mezclando" datos manualmente, lo cual ensucia el código.
*/

  static async findById(id) {
    const query = `
      SELECT u.*, r.name as role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1;
    `;

    try {
      const { rows } = await pool.query(query, [id]);
      return rows[0]; // Retorna el usuario o undefined si no lo encuentra
    } catch (error) {
      throw error;
    }
  }
}

export default UserModel;
