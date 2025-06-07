// RUTA: frontend/src/components/Register.js (o donde lo tengas)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/styles/Register.css';

// ANOTACIÓN: Cambiado el nombre del componente de LoginForm a RegisterForm para mayor claridad.
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    apellido: '',
    email: '',
    password: '',
    // ANOTACIÓN: El rol por defecto ahora es una cadena vacía para forzar al usuario a seleccionar uno.
    rol_id: '', 
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ANOTACIÓN: Validamos que se haya seleccionado un rol antes de enviar.
    if (!formData.rol_id) {
      alert('Por favor, seleccione un rol.');
      return;
    }

    // ANOTACIÓN: Creamos un objeto limpio para enviar, convirtiendo rol_id a número
    // y excluyendo cualquier otro campo innecesario como 'empleado_id'.
    const dataToSend = {
      nombre_usuario: formData.nombre_usuario,
      apellido: formData.apellido,
      email: formData.email,
      password: formData.password,
      rol_id: Number(formData.rol_id)
    };
    
    console.log('Datos a enviar:', dataToSend);
    
    try {
      // ANOTACIÓN: La URL apunta al puerto 3000, donde corre tu backend.
      const response = await fetch('http://localhost:3001/api/auth/register', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Registro exitoso:', result);
        alert('¡Usuario registrado con éxito!');
        navigate('/login');
      } else {
        console.error('Error al registrar:', result);
        // Muestra el mensaje de error del backend, que es más específico.
        alert(`Error al registrar: ${result.message}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    }
  };
  
  return (
    <div className='body'>
      <div className="register-form-container">
        <img src="/img/Home/logoEM.jpg" alt="Logo Empanadas Emanuel" className="logoEM" />
        <h2 className='titulo-register-form'>Registro de trabajador</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre_usuario">Nombre:</label>
            <input
              autoFocus
              type="text"
              id="nombre_usuario"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleChange}
              required
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}"
              title="Solo letras y espacios. Mínimo 3 caracteres."
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido:</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}"
              title="Solo letras y espacios. Entre 3 y 50 caracteres."
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              // ANOTACIÓN: Expresión regular corregida para evitar advertencias en la consola.
              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              title="Debe ser un correo válido. Ejemplo: usuario@dominio.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rol_id">Rol de Empresa:</label>
            <select
              id="rol_id"
              name="rol_id"
              value={formData.rol_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un rol</option>
              <option value='1'>Administrador</option>
              <option value='2'>Auxiliar</option>
              <option value="3">Bodega</option>
              <option value="4">Producción</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}"
              title="Debe tener entre 8 y 20 caracteres, incluyendo letras y al menos un número."
            />
          </div>

          <button className='button-form-register' type="submit">Crear cuenta</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
