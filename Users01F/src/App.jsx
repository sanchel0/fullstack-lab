import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { AuthRoutes } from "./routes/AuthRoutes";
import { UsersRoutes } from "./routes/UsersRoutes";
import Navbar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  return (
    <div>
      <h1>Bienvenido a la App</h1>
      <Link to="/register">
        <button>Ir a Registrarse</button>
      </Link>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route
            path="/unauthorized"
            element={<h1>No tienes permiso para estar aquí 🛑</h1>}
          />
          {/*UsersRoutes()*/}
          {/* CAMBIO AQUÍ: Usa el componente directamente o asegúrate de que UsersRoutes 
      no rompa la jerarquía. Lo ideal es que UsersRoutes sea un componente <UsersRoutes /> */}
          <Route path="/users/*" element={<UsersRoutes />} />
          {/*AuthRoutes()*/}
          <Route path="/*" element={<AuthRoutes />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

//Aunque {UsersRoutes()} sea "más fácil" porque es como copiar y pegar, la opción de <UsersRoutes /> (como componente) es la que usan los profesionales. Si usas <UsersRoutes />, App.jsx solo sabe que "todo lo que empiece por /users va para allá". Si usas {UsersRoutes()}, si mañana quieres que las rutas de usuarios cuelguen de /dashboard/users en lugar de /users, tienes que entrar a UsersRoutes.jsx y cambiar todos los paths uno por uno (/dashboard/users, /dashboard/users/:id, etc.). Con <UsersRoutes /> App dice: "Yo solo sé que si la URL empieza con /users, le paso la pelota a UsersRoutes. Lo que pase de ahí para adentro, es su problema, no el mío".

/* ---- Link/NavLink depende de Route

- El NavLink (o Link) solo tiene una misión: cambiar la URL del navegador sin que la página se recargue. Si haces clic en Movies, el NavLink le dice al navegador: "Oye, ahora estamos en misitio.com/movies".
- El <Route> está escuchando constantemente la URL. Si tienes el NavLink pero no tienes el Route correspondiente, la URL cambiará arriba, pero el contenido de tu página se quedará en blanco (o no cambiará), porque nadie sabe qué componente debe aparecer para esa dirección.

---- Donde tú coloques el componente <Routes>, ahí es donde aparecerá el "dibujo" (el componente) que coincida con la URL.

Si tú metes tus rutas dentro de un div con un estilo específico, todos los componentes que carguen esas rutas heredarán ese contenedor.
*/
