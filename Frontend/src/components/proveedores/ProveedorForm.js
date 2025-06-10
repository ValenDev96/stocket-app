// C:\Users\alexa\stocket-app\Backend\controllers\proveedorController.js

import { useState } from 'react';
import { crearProveedor } from '../../services/proveedoresService';

function ProveedorForm() {
  // 1. ELIMINAMOS 'id' del estado inicial del formulario
  const [form, setForm] = useState({
    nombre: '',
    informacion_contacto: '',
    direccion: '',
  });

  const handleSiguiente = (e) => {
  e.preventDefault();
  setForm({ nombre: '', informacion_contacto: '', direccion: '' });
};

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 'form' ahora solo contiene nombre, informacion_contacto, y direccion.
      // El backend ya está configurado para no esperar 'id'.
      await crearProveedor(form);
      alert('Proveedor registrado con éxito');
      // 2. Reiniciamos el estado sin 'id'
      setForm({ nombre: '', informacion_contacto: '', direccion: '' });
    } catch (error) {
      console.error('Error al registrar proveedor desde frontend:', error); // Agregamos un console.error para depuración
      alert(`Error al registrar proveedor: ${error.message}`); // Mensaje más descriptivo
    }
  };

  return (
    <div className="container">
      <h3>Registrar Proveedor</h3>
      <form onSubmit={handleSubmit}>
        {/* 3. ELIMINAMOS COMPLETAMENTE EL INPUT DEL ID */}
        {/*
        <input
          name="id"
          value={form.id}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="ID"
          required
        />
        */}
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Nombre"
          required
        />
        <input
          name="informacion_contacto"
          value={form.informacion_contacto}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Información de contacto"
          required
        />
        <input
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Dirección"
          required
        />
        <button className="btn btn-primary" type="submit">
          Guardar
        </button>
        <button className="btn btn-danger" onClick={handleSiguiente}>
          Siguiente
        </button>
      </form>
    </div>
  );
}

export default ProveedorForm;