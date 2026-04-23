import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers } from "../../services/auth";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error("No se pudieron cargar los usuarios", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Función para manejar el clic en modificar
  const handleEdit = (user) => {
    // Al navegar, pasamos todo el objeto user en el estado por si lo necesitamos
    // aunque lo ideal es que la página de edición cargue los datos por ID.
    // Sino se hace un GetById en el page Edit, puede ocurrir que mientras tú tenías la tabla abierta, otro administrador cambió el email de ese usuario, tú estarás editando datos viejos.
    navigate(`/users/edit/${user.id}`, { state: { user } });
  };

  if (loading) return <p>Cargando lista de usuarios...</p>;

  return (
    <div className="container" style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Gestión de Usuarios</h2>
        <Link to="/users/new" className="btn-primary">
          Crear Nuevo Usuario
        </Link>
      </div>

      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Username</th>
              <th style={tableHeaderStyle}>Nombre Completo</th>
              <th style={tableHeaderStyle}>Rol</th>
              <th style={tableHeaderStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={tableRowStyle}>
                <td style={tableCellStyle}>#{user.id}</td>
                <td style={tableCellStyle}>
                  <strong>{user.username}</strong>
                </td>
                <td style={tableCellStyle}>
                  {user.first_name} {user.last_name}
                </td>
                <td style={tableCellStyle}>
                  {/* Badge visual para el Rol */}
                  <span style={getBadgeStyle(user.role_name)}>
                    {user.role_name}
                  </span>
                </td>
                <td style={tableCellStyle}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link to={`/users/${user.id}`}>
                      <button
                        className="btn-view"
                        style={{ cursor: "pointer" }}
                      >
                        Ver Detalles
                      </button>
                    </Link>

                    {/* Botón Modificar que ya conoce el role_id */}
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn-edit"
                      style={{ cursor: "pointer" }}
                    >
                      Modificar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// --- Estilos en objetos (para mantener el ejemplo simple) ---

const tableHeaderStyle = {
  padding: "12px",
  borderBottom: "2px solid #ddd",
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};

const tableRowStyle = {
  transition: "background-color 0.2s",
};

const getBadgeStyle = (role) => ({
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "0.85rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  backgroundColor: role === "admin" ? "#ffebee" : "#e3f2fd",
  color: role === "admin" ? "#c62828" : "#1565c0",
  border: `1px solid ${role === "admin" ? "#ef9a9a" : "#90caf9"}`,
});

export default UserList;
