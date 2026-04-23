import { z } from "zod";
import validator from "validator";
/*. ¿Qué hace exactamente validator.escape()?
No "borra" los símbolos, los transforma en entidades HTML.
  < se convierte en &lt;
  > se convierte en &gt;
  & se convierte en &amp;

Si un usuario quiere llamarse C&A_Rocks o su contraseña es P@ss$$123, y tú le borras los símbolos, ¡lo vas a volver loco!

Si guardas &lt;script&gt; en la base de datos y luego lo muestras en tu página de React, el navegador lo dibujará como texto literal y no ejecutará el código.

No hay riesgo de ejecución porque la contraseña nunca se "renderiza" (no se muestra en pantalla) ni se ejecuta como código. Cuando un usuario envía una contraseña maliciosa como <script>alert('hack')</script>, una vez que se convierte en un hash, el código malicioso ya no existe; solo queda una cadena de texto aleatoria que no tiene ningún poder.

---¿Por qué no se puede "ejecutar" el codigo del password?
Para que un código malicioso (XSS) funcione, se necesitan dos cosas:

  - Que el código se guarde tal cual (como texto plano).
  - Que tú lo vuelvas a mostrar en una página web.

Nadie muestra contraseñas en una página. En tu perfil, sueles mostrar el email o el username, pero la contraseña siempre está oculta o representada por asteriscos ****. Como nunca imprimes el contenido de la contraseña en el HTML, el navegador jamás intentará "leer" o "ejecutar" lo que haya adentro.

---El peligro de usar .transform() o .escape() en Passwords

Si el día de mañana decides cambiar de librería de sanitización o dejas de usarla, cuando el usuario intente loguearse con su contraseña original (p@ss<word), el sistema dirá: "Error, contraseña incorrecta", porque el hash no coincidirá con la versión "limpia".

--Regla de oro: La contraseña es un "secreto binario". Debes guardarla exactamente como el usuario la escribió (en su forma de hash) para que siempre pueda entrar.

--El hashing es, de hecho, una de las mejores defensas "accidentales" contra la Inyección SQL en las contraseñas.
*/

// 1. Schema Base: Define las reglas para cada campo individualmente
const userSchema = z.object({
  username: z
    .string({ required_error: "El campo usuario es obligatorio" }) // Si no viene la llave en el JSON
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres")
    .max(50, "Máximo 50 caracteres")
    .transform((val) => validator.escape(val)),
  email: z
    .string()
    //.email("Formato de email inválido")
    .max(255)
    .refine((val) => validator.isEmail(val), { message: "Email inválido" }),
  password: z
    .string()
    .min(5, "La contraseña debe tener al menos 5 caracteres")
    .max(100),
  first_name: z.string().min(1, "El nombre es obligatorio").max(100),
  last_name: z.string().min(1, "El apellido es obligatorio").max(100),
  role_id: z.number().int().positive().optional(), // Opcional porque en la DB tiene un DEFAULT 2
  is_active: z.boolean().optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark"]).optional(),
      language: z.string().min(2).max(5).optional(),
    })
    .optional(),
});

// ESCENARIO A: Perfil básico (Solo lo que el usuario puede tocar)
// Lo hacemos parcial de una vez porque es para un UPDATE
export const selfUpdateSchema = userSchema.pick({
  email: true,
  first_name: true,
  last_name: true,
  preferences: true,
});

// ESCENARIO B: Admin (Toma el de arriba y le SUMA los campos de poder)
export const adminUpdateSchema = selfUpdateSchema.merge(
  userSchema.pick({
    username: true,
    role_id: true,
    is_active: true,
  }),
);
//Lo ideal y más profesional es mantener tus esquemas base "limpios" (con los campos obligatorios) y aplicar el .partial() recién en las funciones de validación o donde realmente necesites que los campos sean opcionales.
export const validateUser = (data) => userSchema.safeParse(data);

export const validateSelfUpdate = (data) =>
  selfUpdateSchema.partial().safeParse(data);

export const validateAdminUpdate = (data) =>
  adminUpdateSchema.partial().safeParse(data);

// 3. Schema para ACTUALIZACIÓN (PATCH /users/:id)
// Usamos .partial() para que TODOS los campos sean opcionales.
// Así el usuario puede mandar solo el email, o solo el nombre.
export const updateUserSchema = userSchema.partial();

// Schema para LOGIN: Solo "picamos" username y password del maestro
// Hereda automáticamente el .min(4), .min(5) y los .max()
export const loginSchema = userSchema.pick({
  username: true,
  password: true,
});

// AQUÍ CREAS AL INSPECTOR (Esta función SÍ ejecuta la validación). .safeParse(object): Es precavido. Nunca lanza un error. En su lugar, te devuelve un objeto que te dice si todo salió bien o no. Es mucho más limpio para el flujo de tu código. .parse(object): Es agresivo. Si los datos están mal, lanza una excepción (throw Error). Si no tienes un try/catch en tu controlador, tu servidor de Node.js se caerá.
/*export function validateUser(object) {
  return userSchema.safeParse(object); // El inspector revisa el objeto
}*/

/*
productSchema.partial()
Cuando haces .partial(), Zod toma todas las reglas (name, price, stock) y las vuelve opcionales automáticamente. Si el usuario solo envía { "price": 100 }, validatePartialProd dirá que es válido. Pero si el usuario envía { "price": "gratis" }, Zod dirá que está mal porque, aunque sea opcional, si viene, debe ser un número.

---¿Qué devuelve safeParse?
Devuelve un objeto con esta estructura:
    - Si los datos son válidos: { success: true, data: { ... } }
    - Si los datos están mal: { success: false, error: ZodError }

// Llamamos a tu función de validación
  const result = validateProd(req.body);

  // Si safeParse dice que NO tuvo éxito...
  if (!result.success) {
    // Respondemos con los errores que Zod generó automáticamente
    return res.status(400).json({ error: result.error.errors });
*/
