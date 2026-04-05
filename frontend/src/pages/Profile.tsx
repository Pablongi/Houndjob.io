// /frontend/src/pages/Profile.tsx
import { useAppContext } from '@/components/filters/FilterContext';
import { supabase } from '@/supabase';

const Profile = () => {
  const { user, setUser } = useAppContext();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">👤 Perfil</h1>
      {user ? (
        <>
          <p className="text-lg">Email: {user.email}</p>
          <button onClick={handleLogout} className="mt-8 bg-red-500 text-white px-6 py-3 rounded-xl">
            Cerrar sesión
          </button>
        </>
      ) : (
        <p>Inicia sesión para ver tu perfil</p>
      )}
    </div>
  );
};

export default Profile;