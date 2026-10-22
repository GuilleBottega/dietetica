import { useState } from "react";
import { signOut } from "firebase/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth } from "../../firebase-config.js";
import { useAuth } from "../../context/useAuth.js";
import "./AdminAuth.css";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [logoutError, setLogoutError] = useState("");

  if (loading) {
    return (
      <p className="admin-auth-status" role="status">
        Verificando sesión...
      </p>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      setLogoutError("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  };

  return (
    <div className="admin-area">
      <div className="admin-session">
        <span>{user.email}</span>
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
