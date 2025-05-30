import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Importamos Axios
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();

  const loginData = {
    nombre_usuario: email, // el backend espera "nombre_usuario"
    contrasena: password,
  };

  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', loginData);

    const { token, usuario } = response.data;

    // Guardar token y usuario en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    // Redirigir dependiendo del rol
    if (usuario.rol_id === 1) {
      navigate('/admin');
    } else if (usuario.rol_id === 2) {
      navigate('/vendedor');
    } else {
      navigate('/Start');
    }
  } catch (error) {
    if (error.response) {
      setErrorMessage(error.response.data.message || 'Error desconocido');
    } else {
      setErrorMessage('Error de conexión con el servidor');
    }
  }
};
  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/img/Home/logoEM.jpg" alt="Logo Empanadas Emanuel" className="logoEM" />
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              autoFocus
              autoComplete="email"
              type="email"
              id="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button-int">Iniciar Sesión</button>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Mostrar el mensaje de error si existe */}

        <div className="forgot-password">
          <Link to="/forgot-password" className="link-button">¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
