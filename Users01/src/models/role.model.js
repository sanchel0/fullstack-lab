import pool from "../config/db.js";

class RoleModel {
  // Obtener todos los roles para el combobox del frontend
  static async findAll() {
    const query = "SELECT id, name FROM roles ORDER BY name ASC;";
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Buscar un ID de rol por su nombre (útil para el registro público)
  static async findByName(name) {
    const query = "SELECT id FROM roles WHERE name = $1;";
    try {
      const { rows } = await pool.query(query, [name]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default RoleModel;
