import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css'; // Asegúrate de que App.css esté correctamente importado

function Home() {
  const navigate = useNavigate();
//comentarios
  // Función para redirigir a Login
  const goToLogin = () => {
    navigate('/login');
  };

  // Función para redirigir a Register
  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="welcome-container">
      {/* Card contenedor */}
      <div className="cards">
      <img src="/img/Home/logoEM.jpg" alt="Logo Empanadas Emanuel" className="logoEM" />
        <h2 className='titulo'>Bienvenidos a Empanadas Emanuel</h2>
        <p>¡Por favor, inicia sesión o regístrate para comenzar!</p>

        {/* Botones para iniciar sesión o registrarse */}
        <button className="boton_inicio" onClick={goToLogin}>
          Iniciar sesión
        </button>
        <button className="boton_registro" onClick={goToRegister}>
          Registrarse
        </button>
      </div>
    </div>
  );
}

export default Home;
