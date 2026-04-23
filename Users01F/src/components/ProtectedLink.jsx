import { NavLink } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export const ProtectedLink = ({ link }) => {
  const { user, isAuthenticated } = useAuthStore();

  // 1. Si el link es público, se muestra siempre
  if (link.roles.includes("public")) {
    return <NavLink to={link.to}>{link.label}</NavLink>;
  }

  // 2. Si es privado y no hay usuario, no se muestra nada
  if (!isAuthenticated || !user) return null;

  // 3. Si el rol del usuario está en la lista de roles permitidos, se muestra
  if (link.roles.includes(user.role)) {
    return <NavLink to={link.to}>{link.label}</NavLink>;
  }

  return null;
};

export default ProtectedLink;
