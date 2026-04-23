export const validate = (validationFn) => (req, res, next) => {
  try {
    const result = validationFn(req.body);

    if (!result.success) {
      // Si falla, respondemos aquí mismo y la petición MUERE aquí. Si result.success es false, Zod garantiza que hay al menos un error. Sin embargo, hay razones técnicas por las que usamos esa validación o el encadenamiento opcional (?.):
      const errorMessages = result.error.issues
        ? result.error.issues.map((err) => ({
            field: err.path[0],
            message: err.message,
          }))
        : [];

      return res.status(400).json({
        error: errorMessages,
      });
    }

    // Si tiene éxito, sobreescribimos req.body con los datos LIMPIOS de Zod
    req.body = result.data; //Si mandan un campo que NO está en el Schema, Zod lo ignora y lo elimina del resultado final (result.data). No tira error, simplemente lo hace desaparecer.
    next(); // Pasamos al siguiente paso (el controlador)
  } catch (error) {
    // Si algo explota internamente, lo mandamos al errorHandler
    next(error);
  }
};

/*¿El parse es solo validación o hace algo más?
El parse (o safeParse) hace tres cosas en una:
  - Validación: Revisa que el email tenga @, que el string mida lo que debe, etc.
  - Transformación/Casting: Si defines un campo como z.coerce.date(), Zod transforma el string que viene del JSON en un objeto Date real de JavaScript.
  - Limpieza (Parsing): Devuelve un nuevo objeto que solo contiene lo que tú permitiste.

Por eso, en tu controlador, ya no hace falta hacer esto:
  const { username, email... } = req.body;
*/
/*---¿Qué pasa con el try/catch del Controller?---
El try/catch en el Controller ahora solo se encargará de errores que Zod no puede predecir, como:
    - Que la base de datos esté caída.
    - Que el email ya exista en la DB (error de unicidad de SQL).
    - Errores de red.
*/
