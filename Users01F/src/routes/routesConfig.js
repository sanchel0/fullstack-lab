export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  SALES: "sales",
  PUBLIC: "public",
};

export const NAV_LINKS = [
  { to: "/", label: "Inicio", roles: [ROLES.PUBLIC] },
  {
    to: "/me",
    label: "Profile",
    roles: [ROLES.USER, ROLES.ADMIN, ROLES.SALES],
  },
  { to: "/users", label: "Admin Users", roles: [ROLES.ADMIN] },
  {
    to: "/dashboard-sales",
    label: "Ventas",
    roles: [ROLES.ADMIN, ROLES.SALES],
  },
];
