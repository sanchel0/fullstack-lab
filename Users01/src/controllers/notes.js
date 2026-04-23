/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                          CONTROLLERS - EXPLICACIÓN                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * ¿QUÉ SON LOS CONTROLLERS?
 * ═══════════════════════════════════════════════════════════════════════════
 * Los controllers son funciones o métodos que actúan como intermediarios entre
 * las rutas (routes) y la lógica de negocio de la aplicación. Son responsables
 * de procesar las peticiones HTTP del cliente y enviar las respuestas adecuadas.
 * 
 * 
 * FUNCIÓN PRINCIPAL DE UN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. Recibir la solicitud (request) del cliente
 * 2. Procesar los datos recibidos
 * 3. Validar la información si es necesario
 * 4. Interactuar con modelos, servicios o bases de datos
 * 5. Manejar la lógica de negocio
 * 6. Enviar una respuesta (response) apropiada al cliente
 * 
 * 
 * UTILIDAD DE LOS CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════
 * ✓ Separación de responsabilidades: Mantiene el código organizado y modular
 * ✓ Reutilización: Permite usar la misma lógica en diferentes rutas
 * ✓ Mantenibilidad: Facilita hacer cambios sin afectar otras partes del código
 * ✓ Testabilidad: Hace más fácil escribir pruebas unitarias
 * ✓ Escalabilidad: Permite que la aplicación crezca de forma ordenada
 * ✓ Claridad: El código es más legible y entendible
 * 
 * 
 * ESTRUCTURA TÍPICA DE UN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * async function nombreAccion(req, res) {
 *   try {
 *     // 1. Obtener datos del request
 *     const datos = req.body;
 *     
 *     // 2. Validar datos
 *     if (!datos) {
 *       return res.status(400).json({ error: 'Datos inválidos' });
 *     }
 *     
 *     // 3. Procesar lógica de negocio
 *     const resultado = await procesarLógica(datos);
 *     
 *     // 4. Enviar respuesta exitosa
 *     res.status(200).json({ success: true, data: resultado });
 *   } catch (error) {
 *     // 5. Manejar errores
 *     res.status(500).json({ error: error.message });
 *   }
 * }
 * 
 * 
 * EJEMPLO PRÁCTICO EN ESTA APLICACIÓN
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * auth.controller.js
 *   - Maneja el registro de usuarios
 *   - Maneja el login de usuarios
 *   - Valida credenciales
 * 
 * user.controller.js
 *   - Obtiene lista de usuarios
 *   - Obtiene un usuario específico
 *   - Actualiza datos de usuario
 *   - Elimina usuarios
 * 
 * role.controller.js
 *   - Crea nuevos roles
 *   - Obtiene roles existentes
 *   - Actualiza permisos de roles
 * 
 * 
 * VENTAJAS DE USAR CONTROLLERS
 * ═══════════════════════════════════════════════════════════════════════════
 * • Código más limpio y organizado
 * • Facilita el debugging y búsqueda de errores
 * • Permite trabajar en equipo de forma más eficiente
 * • Reduce la duplicación de código
 * • Mejora el rendimiento de la aplicación
 * • Facilita la documentación del código
 * 
 * 
 * PATRÓN MVC USADO EN ESTA ESTRUCTURA
 * ═══════════════════════════════════════════════════════════════════════════
 * M (Model)      → src/models/        → Define la estructura de datos
 * V (View)       → Respuestas JSON    → Lo que se envía al cliente
 * C (Controller) → src/controllers/   → Procesa la lógica entre modelo y vista
 * 
 */

// Exportar un objeto vacío para que el archivo sea válido como módulo
module.exports = {};
