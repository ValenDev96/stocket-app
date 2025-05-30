import React, { useState } from 'react';
import '../styles/ForgotPassword.css';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = (e) => {
    e.preventDefault();
    console.log('Enviando recuperación a:', email);
    setResetSent(true);
    // Aquí va la lógica para enviar email de recuperación
  };

  return (
    <div className="login-container">
      <div className="login-card">
          <img src="/img/Home/logoEM.jpg" alt="Logo Empanadas Emanuel" className="logoEM" />
        <h2>Olvidaste tu contraseña</h2>
        {!resetSent ? (
          <form onSubmit={handleResetPassword}>
            <div className="form-group1">
              <label htmlFor="resetEmail">Correo Electrónico</label>
              <input
                autoFocus
                type="email"
                id="resetEmail"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">Enviar</button>
          </form>
        ) : (
          <p className="confirmation-message">
            Se ha enviado un enlace de recuperación al correo proporcionado.
          </p>
        )}
        <div className="forgot-password">
          <Link to="/Login" className="link-button">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
