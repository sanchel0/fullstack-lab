import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/auth";

export default function Register() {
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Capturamos todos los campos del formulario
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      // Usamos el servicio createUser que me mostraste antes
      const body = await register(data);
      console.log(body);
      alert("¡Cuenta creada con éxito!");
      navigate("/login"); // Redirigimos al login para que entre
    } catch (err) {
      alert(`Error al registrar: ${err.message}`);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <h2 className="register-title">Crear Cuenta</h2>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de usuario</label>
            <input
              name="username"
              className="form-input"
              type="text"
              placeholder="username123"
              required
            />
          </div>

          <div className="form-row" style={{ display: "flex", gap: "10px" }}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                name="first_name"
                className="form-input"
                type="text"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input
                name="last_name"
                className="form-input"
                type="text"
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              className="form-input"
              type="email"
              placeholder="correo@ejemplo.com"
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
            Registrarse
          </button>
        </form>

        <div className="register-footer">
          <span className="footer-text">¿Ya tienes cuenta?</span>
          <Link to="/login" className="link-login">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
