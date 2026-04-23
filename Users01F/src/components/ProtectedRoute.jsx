import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
/**
 * @param isAllowed: Booleano que indica si tiene permiso (ej: user.role === 'admin')
 * @param redirectTo: Ruta a la que mandaremos al usuario si no tiene permiso
 * @param children: Para casos donde quieras envolver componentes directamente
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  console.log(isAuthenticated);
  console.log(user);
  // 1. Si no está autenticado -> Al Login
  if (!isAuthenticated) {
    // 'replace' evita que el usuario pueda volver atrás con el botón del navegador
    return <Navigate to="/login" replace />;
  }

  // 2. Si no se definieron roles permitidos, basta con estar logueado
  if (!allowedRoles) {
    return <Outlet />;
  }

  // 3. Verificamos si el rol del usuario está en la lista de permitidos
  // Convertimos allowedRoles a array si pasan un solo string para que siempre funcione
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasPermission = roles.includes(user?.role);

  if (!hasPermission) {
    // Si está logueado pero no tiene el rol -> A una página de "No Autorizado"
    return <Navigate to="/unauthorized" replace />;
  }

  // SI hay children (Forma B), los muestra.
  // SI NO hay (Forma A), muestra el Outlet para las rutas hijas.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
