import { useFormEdit } from "../../hooks/useFormEdit";
import { updateProfile } from "../../services/auth";
import EditableField from "../../components/EditableField";

const ProfileEdit = ({ user, onCancel, onSuccess }) => {
  // Pasamos la función de guardado al hook
  const handleSave = async (data) => {
    try {
      // 1. Intentamos la petición
      const result = await updateProfile(data);

      // 2. Si llegamos aquí, la API respondió con éxito (200 OK)
      // Mezclamos los datos viejos con los nuevos que devolvió el servidor
      const updatedUser = { ...user, ...result.data };

      // 3. Avisamos al padre solo si todo salió bien
      onSuccess(updatedUser);
    } catch (error) {
      // 4. Si la API da error (400, 500, Red), entramos aquí
      console.error("Error al actualizar perfil:", error);

      // No llamamos a onSaveSuccess, por lo tanto:
      // - El modo edición NO se cierra.
      // - El usuario NO pierde lo que escribió.
      // - El botón de "Guardando..." se desbloquea (gracias al hook).

      // Opcional: El hook ya hace un alert, pero aquí podrías manejar
      // lógica específica de este componente si quisieras.
      throw error; // Re-lanzamos para que el hook sepa que falló y ponga isSubmitting en false
    }
  };

  // Usamos el hook (podemos pasarle la whitelist de campos permitidos)
  const { handleSubmit, isSubmitting } = useFormEdit(user, handleSave);

  return (
    <form onSubmit={handleSubmit} className="profile-card">
      <div className="profile-field">
        <label>Nombre</label>
        <input
          name="first_name"
          defaultValue={user.first_name}
          className="profile-input"
        />
      </div>

      <div className="profile-field">
        <label>Apellido</label>
        <input
          name="last_name"
          defaultValue={user.last_name}
          className="profile-input"
        />
      </div>

      <div className="profile-field">
        <label>Email</label>
        <input
          type="email"
          name="email"
          defaultValue={user.email}
          className="profile-input"
        />
      </div>

      <div className="profile-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ProfileEdit;
