const EditableField = ({ label, name, value, isEditing, type = "text" }) => (
  <p className="profile-field">
    <strong>{label}:</strong> {/* <--- Este {" "} añade un espacio en blanco */}
    {isEditing ? (
      <input
        key={`${name}-${isEditing}`} // <--- ESTO ES EL TRUCO
        type={type} // Si no se envía nada, será "text"
        name={name}
        defaultValue={value}
        className="profile-input"
      />
    ) : (
      <span className="profile-value">{value}</span>
    )}
  </p>
);

export default EditableField;
