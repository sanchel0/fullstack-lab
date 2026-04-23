import pool from "../config/db.js";
import bcrypt from "bcrypt";
import readline from "readline";

// Configuración para leer la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SALT_ROUNDS = 10;

// Función para hashear y actualizar un usuario específico
const hashUserPassword = async (id) => {
  const { rows } = await pool.query(
    "SELECT id, password_hash FROM users WHERE id = $1",
    [id],
  );

  if (rows.length === 0) {
    console.log(`❌ Error: No se encontró el usuario con ID ${id}`);
    return;
  }

  const user = rows[0];
  if (user.password_hash.startsWith("$2b$")) {
    console.log(`⚠️ El usuario ${id} ya tiene la contraseña hasheada.`);
    return;
  }

  const newHash = await bcrypt.hash(user.password_hash, SALT_ROUNDS);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    newHash,
    id,
  ]);
  console.log(`✅ Usuario ${id} actualizado con éxito.`);
};

// Función para hashear todos los que falten
const hashAllMissing = async () => {
  const { rows: users } = await pool.query(
    "SELECT id, password_hash FROM users",
  );
  let count = 0;

  for (let user of users) {
    if (!user.password_hash.startsWith("$2b$")) {
      const newHash = await bcrypt.hash(user.password_hash, SALT_ROUNDS);
      await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
        newHash,
        user.id,
      ]);
      console.log(`✔ Hasheado ID: ${user.id}`);
      count++;
    }
  }
  console.log(`\n✨ Proceso terminado. Se actualizaron ${count} usuarios.`);
};

// --- MENÚ PRINCIPAL ---
console.log("\n--- GESTOR DE CONTRASEÑAS ADMIN ---");
console.log("1. Hashear TODOS los usuarios (solo los que no tengan hash)");
console.log("2. Hashear un usuario específico por ID");
console.log("3. Salir");

rl.question("\nSelecciona una opción (1-3): ", async (choice) => {
  if (choice === "1") {
    await hashAllMissing();
    rl.close();
  } else if (choice === "2") {
    rl.question("Introduce el ID del usuario: ", async (id) => {
      await hashUserPassword(id);
      rl.close();
    });
  } else {
    console.log("Saliendo...");
    rl.close();
  }
});

// Al cerrar la consola, cerramos la conexión a la base de datos
rl.on("close", () => {
  pool.end();
  process.exit(0);
});
