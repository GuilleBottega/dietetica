import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config.js';
import { useAuth } from '../context/useAuth.js';
import '../components/adminComponents/AdminAuth.css';

export default function AdminLayouts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('No se pudo cerrar la sesión:', error);
      setLogoutError('No se pudo cerrar la sesión. Intentá nuevamente.');
    }
  };

  return (
    <div className="admin-area">
      <div className="admin-session">
        <p className="admin-session__welcome">
          ¡Hola de nuevo, {user.email}!
        </p>
        <nav className="admin-session__navigation" aria-label="Administración">
          <Link to="/admin/products">Productos</Link>
          <Link to="/admin/orders">Pedidos</Link>
        </nav>
        <button type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
      {logoutError && (
        <p className="admin-login-form__error" role="alert">
          {logoutError}
        </p>
      )}
      <Outlet />
    </div>
  );
}
