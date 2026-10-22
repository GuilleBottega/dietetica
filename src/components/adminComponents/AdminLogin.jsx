import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase-config.js";
import "./AdminAuth.css";

const getLoginError = (error) => {
  if (error.code === "auth/too-many-requests") {
    return "Hubo demasiados intentos. Esperá unos minutos y volvé a probar.";
  }
  if (error.code === "auth/network-request-failed") {
    return "No se pudo conectar con Firebase. Revisá tu conexión e intentá otra vez.";
  }
  return "El correo o la contraseña no son válidos.";
};

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      const destination = location.state?.from;
      navigate(
        destination
          ? `${destination.pathname}${destination.search ?? ""}`
          : "/admin",
        { replace: true }
      );
    } catch (error) {
      console.error("No se pudo iniciar sesión en administración:", error);
      setErrorMessage(getLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="admin-login-page">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <p className="admin-login-form__eyebrow">Administración</p>
        <h1>Iniciar sesión</h1>
        <p className="admin-login-form__description">
          Ingresá con el correo y la contraseña autorizados.
        </p>

        <label htmlFor="admin-email">Correo electrónico</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="admin-password">Contraseña</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {errorMessage && (
          <p className="admin-login-form__error" role="alert">
            {errorMessage}
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </section>
  );
}
