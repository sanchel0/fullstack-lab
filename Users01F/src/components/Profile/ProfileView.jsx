const ProfileView = ({ user, onEdit }) => {
  return (
    <div className="profile-card">
      <div className="profile-field">
        <strong>Nombre:</strong> <span>{user.first_name}</span>
      </div>
      <div className="profile-field">
        <strong>Apellido:</strong> <span>{user.last_name}</span>
      </div>
      <div className="profile-field">
        <strong>Email:</strong> <span>{user.email}</span>
      </div>
      <div className="profile-field">
        <strong>Username:</strong> <span>{user.username}</span>
      </div>
      <div className="profile-field">
        <strong>Rol:</strong> <span>{user.role}</span>
      </div>

      <button type="button" onClick={onEdit} className="btn-edit">
        Editar mis datos
      </button>
    </div>
  );
};

export default ProfileView;
