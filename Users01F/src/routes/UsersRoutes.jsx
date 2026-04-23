import { Routes, Route } from "react-router-dom";
// Importa tus componentes de página (ajusta las rutas según tu carpeta)
import UserList from "../pages/users/UserList";
import UserDetails from "../pages/users/UserDetails";
import UserEdit from "../pages/users/UserEdit";
import ProtectedRoute from "../components/ProtectedRoute";
import Profile from "../pages/auth/Profile";

export const UsersRoutes = () => (
  // CAMBIO CLAVE: Envolver con <Routes> en lugar de <>
  <Routes>
    {/* Rutas para CUALQUIER usuario logueado */}
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<UserList />} />
    </Route>

    {/* Ruta para ver un registro específico por su ID (GET BY ID) */}
    {/* El ":id" es un parámetro dinámico que podrás leer con useParams() */}
    {/* Rutas solo para ADMIN */}
    <Route
      element={
        <ProtectedRoute allowedRoles="admin" /> /*allowedRoles={["admin", "manager"]}*/
      }
    >
      <Route path="/:id" element={<UserDetails />} />
      <Route path="/edit/:id" element={<UserEdit />} />
    </Route>

    {/* Puedes agregar más rutas aquí, como /users/edit/:id */}
  </Routes>
);

/*
Esta ruta captura todo lo que empiece con /users y se lo pasa a UsersRoutes
  <Route path="/users/*" element={<UsersRoutes />} />
OJO: Si en App.js definiste path="/users/*", aquí el path relativo debe ser "/" para que sea "/users 
  <Route path="/" element={<UserList />} />

---Hay una razón por la que en proyectos grandes se prefiere el otro método (<UsersRoutes /> con su propio <Routes>):
  - Rutas relativas: Si usas {UsersRoutes()}, tienes que escribir siempre la ruta completa: path="/users" y path="/users/:id".
  - Si usas el componente independiente: Puedes usar rutas relativas. El padre dice path="/users/*" y el hijo simplemente dice path="/" y path="/:id". Es más limpio si decides cambiar el nombre de la sección (por ejemplo, de /users a /admin/users), solo cambias una línea en el padre.
*/
