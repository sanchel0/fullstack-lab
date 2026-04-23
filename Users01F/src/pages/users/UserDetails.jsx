import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserById } from "../../services/auth";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  // Estado para controlar la visibilidad de los datos técnicos
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        console.error("No se pudo cargar el usuario", err);
        setError("Usuario no encontrado o error en el servidor");
      }
    };
    fetchUser();
  }, [id]);

  if (error)
    return (
      <p style={{ color: "red" }}>
        {error} <Link to="/users">Volver</Link>
      </p>
    );
  if (!user) return <p>Cargando información del usuario...</p>;

  return (
    <div
      className="container"
      style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}
    >
      <Link to="/users"> &larr; Volver al listado</Link>

      <h2>Detalles del Usuario #{user.id}</h2>

      <p>
        <strong>Username:</strong> {user.username}
      </p>
      <p>
        <strong>Nombre completo:</strong> {user.first_name} {user.last_name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Estado:</strong> {user.is_active ? "Activo" : "Inactivo"}
      </p>
      <p>
        <strong>Fecha de registro:</strong>{" "}
        {new Date(user.created_at).toLocaleDateString()}
      </p>

      {/* Botón para mostrar/ocultar */}
      <button
        onClick={() => setShowSecrets(!showSecrets)}
        style={{
          backgroundColor: showSecrets ? "#666" : "#007bff",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {showSecrets
          ? "Ocultar Datos de Auditoría"
          : "Ver Datos de Auditoría (Hash)"}
      </button>

      {/* Sección condicional */}
      {showSecrets && (
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px dashed #dc3545",
            borderRadius: "5px",
          }}
        >
          <p style={{ color: "#d32f2f", fontSize: "0.9rem", marginTop: 0 }}>
            <strong>⚠️ Información Sensible:</strong>
          </p>
          <p style={{ marginBottom: "5px", color: "black" }}>
            <strong>Hash de Password:</strong>
          </p>
          <code
            style={{
              display: "block",
              wordBreak: "break-all",
              backgroundColor: "#6f6f6f",
              padding: "10px",
              borderRadius: "4px",
              fontSize: "0.85rem",
            }}
          >
            {user.password_hash}
          </code>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
