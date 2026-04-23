export const ROLES = {
  ADMIN: 1,
  USER: 2,
  GUEST: 3,
};

/*¿Está mal hardcodear y poner el id 2 a fuego?
Para un proyecto que está empezando o es pequeño, no está mal, funciona y es seguro porque controlas tú el valor. Pero en un entorno profesional, se evita por dos razones:
    - Legibilidad: Alguien que lee tu código no sabe qué significa "2". ¿Es Admin? ¿Es User? ¿Es Invitado?
    - Mantenibilidad: Si mañana borras los roles y el "User" pasa a ser el ID 5, tienes que buscar en todos tus archivos dónde pusiste un 2.
*/

/*Nivel 2: La subconsulta en SQL (Dinámico)
Si no quieres arriesgarte con IDs numéricos, puedes hacer que la base de datos busque el ID por el nombre del rol. Esto es muy robusto.

// En tu UserModel.create
const query = `
  INSERT INTO users (username, email, password_hash, first_name, last_name, role_id)
  VALUES ($1, $2, $3, $4, $5, (SELECT id FROM roles WHERE name = 'user'))
  RETURNING *;
`;
*/
