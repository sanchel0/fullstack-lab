import { useAuthStore } from "../../stores/useAuthStore";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProfile } from "../../services/auth";
import ProfileEdit from "../../components/Profile/ProfileEdit";
import ProfileView from "../../components/Profile/ProfileView";

const Profile = () => {
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null); //Estado local para los datos frescos
  const [loading, setLoading] = useState(true);

  // 1. El fetch solo se define aquí
  const fetchProfile = async () => {
    try {
      const freshData = await getProfile();
      setUser(freshData);
    } catch (error) {
      if (error.status === 401) clearSession();
    } finally {
      setLoading(false);
    }
  };
  // 2. useEffect con array vacío []
  // Esto garantiza que SOLO se ejecuta cuando el usuario entra a la página de Perfil.
  useEffect(() => {
    fetchProfile();
  }, []);
  // Al cargar la página, traemos los datos reales del servidor
  /*useEffect(() => {
    const fetchProfile = async () => {
      console.log("useEffect ejecutado");
      try {
        const freshData = await getProfile(); // Tu servicio que llama a /users/me
        setUser(freshData);
      } catch (error) {
        console.error("Error cargando perfil");
        if (error.status === 401) {
          clearSession(); // <--- ESTO actualiza el Navbar a "Offline" inmediatamente
          alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [clearSession]);*/
  if (loading) return <p>Cargando datos frescos...</p>;
  if (!user) return <p>No has iniciado sesión.</p>;
  //--Debes mover todos tus Hooks a la parte superior del componente, antes de cualquier if o return.--
  //---Si no pusiéramos el if (loading), React intentaría renderizar el formulario inmediatamente. Como el useEffect es asíncrono, en el primer milisegundo la variable user todavía es null. Al poner los if arriba, proteges al componente: "No dibujes el formulario hasta que estemos seguros de que tenemos los datos". Sin esos mensajes, el usuario vería una pantalla con etiquetas vacías o campos parpadeando mientras llegan los datos. Mostrar un mensaje de "Cargando" o "Error" le da feedback al usuario de que la app está trabajando.

  /*---Lo ideal es que el Frontend solo envíe lo que realmente cambió.---
    En el Frontend: Envías un JSON más pequeño: {"email": "nuevo@mail.com"}. Si dejas tu código como está (enviando todo), funcionará. Pero si implementas el filtro de "campos modificados", tu aplicación será más robusta, consumirá menos datos y evitarás escrituras innecesarias en el disco de tu base de datos. Evita que viaje basura por la red.*/
  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>
      {console.log(isEditing)}
      {isEditing ? (
        <ProfileEdit
          user={user}
          onCancel={() => setIsEditing(false)}
          onSuccess={(updatedData) => {
            setUser(updatedData);
            setIsEditing(false);
          }}
        />
      ) : (
        <ProfileView user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};

export default Profile;
