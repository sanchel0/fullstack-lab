import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, adminUpdateUser } from "../../services/auth";
import { getAllRoles } from "../../services/role";
import { useFormEdit } from "../../hooks/useFormEdit";

const UserEdit = () => {
  const { id } = useParams(); // Obtenemos el ID de /users/edit/:id
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, rolesData] = await Promise.all([
          getUserById(id),
          getAllRoles(),
        ]);
        setUser(userData);
        setRoles(rolesData);
      } catch (error) {
        console.error("Error al cargar:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Función que el hook llamará si hay cambios
  const handleSave = async (data) => {
    await adminUpdateUser(id, data);
    alert("Usuario actualizado");
    navigate("/users");
  };

  // Usamos el hook genérico pasándole los datos del usuario
  const { handleSubmit, isSubmitting } = useFormEdit(user, handleSave);

  /*
  const handleSubmit2 = async (event) => {
    event.preventDefault();

    // 1. Capturamos los datos actuales del formulario
    const formData = new FormData(event.currentTarget);
    const sentData = Object.fromEntries(formData.entries());

    // 2. FILTRADO: Comparamos contra el objeto 'user' que cargamos en el useEffect
    const updatedData = {};

    Object.keys(sentData).forEach((key) => {
      // IMPORTANTE: Convertimos a String para comparar, ya que los inputs siempre devuelven strings
      // pero el role_id de la DB podría ser un número.
      if (String(sentData[key]) !== String(user[key])) {
        updatedData[key] = sentData[key];
      }
    });

    // 3. Si no cambió nada, simplemente volvemos atrás o avisamos
    if (Object.keys(updatedData).length === 0) {
      alert("No se realizaron cambios.");
      navigate("/users");
      return;
    }

    try {
      // 4. Enviamos SOLO los campos modificados
      await adminUpdateUser(id, updatedData);
      alert("Usuario actualizado correctamente");
      navigate("/users");
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || error.message));
    }
  };*/

  if (loading) return <p>Cargando datos del usuario...</p>;

  return (
    <div className="container">
      <h2>Modificar Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input name="username" defaultValue={user?.username} required />
        </div>
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            defaultValue={user?.email}
            required
          />
        </div>
        <div>
          <label>Nombre</label>
          <input name="first_name" defaultValue={user?.first_name} />
        </div>
        <div>
          <label>Apellido</label>
          <input name="last_name" defaultValue={user?.last_name} />
        </div>
        <div>
          <label>Rol</label>
          {/* El defaultValue aquí es clave para que el combo empiece donde debe */}
          <select name="role_id" defaultValue={user?.role_id}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Actualizar"}
        </button>
      </form>
    </div>
  );
};
//Si un campo no debe ser editado por el usuario, lo ideal es que no sea un campo de formulario editable. Si no hay un input, select o textarea con un atributo name, FormData simplemente no lo capturará. No necesitas lógica extra en el hook. El navegador solo envía lo que el usuario puede tocar. De esta form, el useFormEdit está bien, ya que desde el formData.entries() no se podrá acceder a los campos que no deben ser modificados.
export default UserEdit;
