import { NavLink } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { NAV_LINKS } from "../routes/routesConfig";
import ProtectedLink from "./ProtectedLink";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav style={{ display: "flex", gap: "10px" }}>
      {NAV_LINKS.map((link) => (
        <ProtectedLink key={link.to} link={link} />
      ))}

      {/* Solo el botón de Login/Logout queda fuera del map por su lógica especial */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {/* Los botones de configuración siempre visibles */}
        <LanguageSelector />
        <ThemeToggle />

        <div
          style={{
            borderLeft: "1px solid #ccc",
            height: "20px",
            margin: "0 5px",
          }}
        />

        {isAuthenticated ? (
          <>
            {/* Si está logueado, mostramos su nombre */}
            <span style={{ fontWeight: "bold", color: "#333" }}>
              Hola, {user?.username || "Usuario"} 👤
            </span>
            <button onClick={logout}>Cerrar Sesión</button>
          </>
        ) : (
          <>
            <span style={{ fontSize: "0.8rem", color: "gray" }}>
              Estado: Offline
            </span>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
  /*return (
    <nav>
      <div>
        <NavLink
          to="/"
          style={{
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          Inicio
        </NavLink>
      </div>
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/register">Register</NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <NavLink to="/users">Admin Users</NavLink>
    </nav>
  );*/
}

/*---¿Por qué React volverá a renderizar el componente automáticamente cuando cambie isAuthenticated?---
Cuando tú haces esto:
  const { isAuthenticated, logout } = useAuthStore();
Estás creando una suscripción. Zustand le dice a React: "Oye, este componente depende de isAuthenticated. Si ese valor cambia en el Store, avísale a este componente para que se pinte de nuevo".

El flujo paso a paso:
  - Click: El usuario hace click en "Cerrar Sesión".
  - Acción: Se ejecuta el método logout() que está dentro del Store.
  - Cambio de Estado: Dentro del Store, haces set({ isAuthenticated: false }).
  - Notificación: Zustand detecta que el estado cambió y "despierta" a todos los componentes que estén usando useAuthStore.
  - Re-render: React vuelve a ejecutar la función Navbar().
  - Nueva Lógica: Al ejecutarse de nuevo, isAuthenticated ahora es false. Por lo tanto, el condicional del JSX ahora entra por el camino del else (mostrando Login y Register) y quita el botón de Logout.
*/

/* desestructuración vs selectores
---Cuando usas desestructuración de esta forma:
const { isAuthenticated, logout } = useAuthStore();
React interpreta que este componente está interesado en TODO lo que hay dentro del Store. Si mañana agregas un estado llamado carritoCount al store y ese número cambia, tu Navbar se volverá a renderizar aunque no use el carrito.

---Cuando usas selectores:
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
React solo "observa" ese valor específico. Si el carritoCount cambia, el Navbar no hace nada.

---¿Se puede hacer que solo renderice cuando cambie uno pero no el otro?
Sí y no. Si necesitas usar tanto logout (una función) como isAuthenticated (un valor), el componente siempre se renderizará cuando isAuthenticated cambie de true a false. No puedes evitar eso porque el JSX depende de ese valor para decidir qué mostrar.

Sin embargo, las funciones (como logout) en Zustand son estables. No cambian nunca. Por lo tanto, llamar a logout no provoca re-renders. Lo que provoca el re-render es el cambio en los datos (el booleano o el objeto user).
*/
