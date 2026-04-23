import { useNavigate, Link } from "react-router-dom";
import { login as loginService } from "../../services/auth";
import { useAuthStore } from "../../stores/useAuthStore";
import { useSettingsStore } from "../../stores/useSettingsStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { syncPreferences } = useSettingsStore.getState();

  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    // Leemos todos los datos del formulario de una vez
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData); // Convierte a objeto: { email: '...', password: '...' }

    try {
      const response = await loginService(data);
      console.log(response.user);
      //login(response.token);
      login(response.user);
      syncPreferences(response.user.preferences);
      navigate("/"); // Al inicio si todo sale bien
    } catch (err) {
      alert("Error: Credenciales no válidas: " + err);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de usuario</label>
            <input
              name="username"
              className="form-input"
              type="text"
              placeholder="Ej: juan_perez"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              name="password"
              className="form-input"
              type="password"
              placeholder="********"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <span className="footer-text">¿No tienes cuenta?</span>
          <Link to="/register" className="link-register">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
