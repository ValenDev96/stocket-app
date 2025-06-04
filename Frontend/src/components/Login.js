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
  setErrorMessage(''); // Limpiar errores previos

  const loginData = {
    email: email, // <--- CORREGIDO: Enviar 'email'
    contrasena: password,
  };

  try {
    // Asegúrate que el puerto aquí (3000) es donde realmente corre tu backend
    const response = await axios.post('http://localhost:3000/api/auth/login', loginData);

    const { token, usuario } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    if (usuario.rol_id === 1) {
      navigate('/Dashboard');
    } else if (usuario.rol_id === 2) {
      navigate('/Dashboard');
    } else {
      navigate('/Dashboard');
    }
  } catch (error) {
    if (error.response) {
      // El servidor respondió con un estado fuera del rango 2xx
      setErrorMessage(error.response.data.message || 'Error en el login desde el servidor');
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      setErrorMessage('No se pudo conectar con el servidor. ¿Está encendido?');
      console.error('Error request:', error.request);
    } else {
      // Algo más causó el error
      setErrorMessage('Ocurrió un error al intentar iniciar sesión.');
      console.error('Error message:', error.message);
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
            title="Debe ser un correo válido. Ejemplo: usuario@dominio.com"
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
            pattern=".{6,20}"
            title="Debe tener entre 6 y 20 caracteres."
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
