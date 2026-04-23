/*---Nomenclatura (Nombres de archivos)
Para que herramientas como Jest o Vitest encuentren tus pruebas automáticamente, se usa una extensión especial. El estándar es:

nombre.test.js

nombre.spec.js (viene de "specification")

Ejemplo: Si tienes un archivo authController.js, su test debería llamarse authController.test.js.
*/

/*---¿Se suben a GitHub?
Sí, absolutamente. Los tests son parte del código. De hecho:

Permiten que otros desarrolladores que descarguen tu proyecto sepan si "rompieron" algo al hacer cambios.

Son fundamentales para el CI/CD (Integración Continua). Cuando subes código a GitHub, programas un servicio (como GitHub Actions) que corre los tests automáticamente. Si un test falla, el código no se despliega a producción.
*/

/*---Mejores prácticas
No testees lo obvio: No hagas unit tests para una función que solo devuelve una variable.

Independencia: Un test no debe depender de que otro test haya corrido antes. Cada uno debe ser capaz de ejecutarse solo.

Base de Datos de Test: Para los Integration Tests, nunca uses la base de datos de producción o desarrollo; usa una en memoria (como mongodb-memory-server) o una base de datos local temporal.
*/
