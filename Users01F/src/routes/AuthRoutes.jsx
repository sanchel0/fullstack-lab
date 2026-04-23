import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
//import ForgotPassword from "../pages/auth/ForgotPassword";
import Profile from "../pages/auth/Profile";
import ProtectedRoute from "../components/ProtectedRoute";

export const AuthRoutes = () => (
  <Routes>
    {/* Rutas de acceso público */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    {/*<Route path="/forgot-password" element={<ForgotPassword />} >*/}
    <Route element={<ProtectedRoute />}>
      <Route path="/me" element={<Profile />} />
    </Route>
    {/* Ruta del perfil del usuario logueado */}
  </Routes>
); //Si consideras que todo lo que tenga que ver con la entidad "User" (ya seas tú o los demás) debe estar bajo el mismo prefijo /users. Eso es lo malo, si se pone dentor de UsersRoutes, deberá la url tener /users/me y eso queda feo, para que quede solo /me debe estar en authRoutes. Aunq en el back la logica del profile esté en el usersRoutes.js, en front esta en authRoutes solo por estética de la url.

/*---¿Qué devuelve AuthRoutes()?---
Cuando haces {AuthRoutes()}, React simplemente copia y pega el contenido de esa función ahí mismo. Como AuthRoutes devuelve un Fragmento <>, el resultado final en tu App.jsx es este:
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />   Inyectado de AuthRoutes
  <Route path="/register" element={<Register />} />  Inyectado de AuthRoutes
</Routes>

Aquí SÍ funciona porque los <Route> son hijos directos del <Routes> de App.jsx.

---¿Por qué UsersRoutes es diferente?
Cuando haces <Route path="/users/*" element={<UsersRoutes />} />, ya no estás "copiando y pegando" código. Estás diciendo: "Si la URL empieza con /users, renderiza el COMPONENTE UsersRoutes".
*/
