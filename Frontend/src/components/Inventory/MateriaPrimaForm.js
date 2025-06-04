// Frontend/src/components/Inventory/MateriaPrimaForm.js
import React, { useState, useEffect } from 'react';

// Definir initialFormState FUERA del componente para que tenga una referencia estable
const STATIC_INITIAL_FORM_STATE = {
  nombre: '',
  proveedor_id: '',
  cantidad: '',
  unidad: 'kg', // Valor por defecto para el select
  fecha_expiracion: '',
  umbral_alerta: '',
};

const MateriaPrimaForm = ({ onSubmit, initialData = null, onCancel, isEditMode = false }) => {
  const [formData, setFormData] = useState(STATIC_INITIAL_FORM_STATE);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        proveedor_id: initialData.proveedor_id || '',
        cantidad: initialData.cantidad || '',
        unidad: initialData.unidad || 'kg',
        // Asegurarse de que la fecha esté en formato YYYY-MM-DD para el input type="date"
        fecha_expiracion: initialData.fecha_expiracion ? initialData.fecha_expiracion.split('T')[0] : '',
        umbral_alerta: initialData.umbral_alerta || '',
      });
    } else {
      // Cuando no está en modo edición o initialData es null (para creación)
      setFormData(STATIC_INITIAL_FORM_STATE);
    }
    // Limpiar mensajes al cambiar de modo o de datos iniciales
    setError('');
    setSuccessMessage('');
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validación básica de frontend
    if (!formData.nombre.trim() || formData.cantidad === '' || !formData.unidad || formData.umbral_alerta === '') {
      setError('Los campos marcados con * (nombre, cantidad, unidad y umbral de alerta) son obligatorios.');
      return;
    }
    if (parseFloat(formData.cantidad) < 0 || parseFloat(formData.umbral_alerta) < 0) {
      setError('Cantidad y umbral de alerta no pueden ser negativos.');
      return;
    }

    try {
      // Preparar datos para enviar (convertir a número si es necesario)
      const dataToSend = {
        ...formData,
        cantidad: parseFloat(formData.cantidad),
        umbral_alerta: parseFloat(formData.umbral_alerta),
        // Enviar null si los campos opcionales están vacíos, para que la BD no los tome como string vacío
        proveedor_id: formData.proveedor_id ? formData.proveedor_id.trim() : null,
        fecha_expiracion: formData.fecha_expiracion ? formData.fecha_expiracion : null,
      };

      await onSubmit(dataToSend); // Llama a la función create o update pasada por props
      setSuccessMessage(isEditMode ? 'Materia prima actualizada con éxito!' : 'Materia prima creada con éxito!');
      
      if (!isEditMode) {
        setFormData(STATIC_INITIAL_FORM_STATE); // Limpiar formulario solo en modo creación si fue exitoso
      }
      // Opcional: cerrar el formulario o limpiar mensaje después de un tiempo
      // setTimeout(() => {
      //   setSuccessMessage('');
      //   if (onCancel && !isEditMode) onCancel(); // Cierra si es creación y hay onCancel
      // }, 2000);

    } catch (err) {
      console.error("Error en handleSubmit de MateriaPrimaForm:", err);
      setError(err.message || (isEditMode ? 'Error al actualizar la materia prima.' : 'Error al crear la materia prima.'));
    }
  };

  const unidadesDisponibles = ['kg', 'g', 'L', 'ml', 'unidades']; // Ajusta según tu ENUM en BD

  return (
    <form onSubmit={handleSubmit} className="materia-prima-form">
      <h3 className="form-title-mpf">{isEditMode ? 'Editar Materia Prima' : 'Agregar Nueva Materia Prima'}</h3>
      
      {error && <p className="error-message-form">{error}</p>}
      {successMessage && <p className="success-message-form">{successMessage}</p>}

      <div className="form-group-mpf">
        <label htmlFor="nombre">Nombre*:</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
      </div>
      <div className="form-group-mpf">
        <label htmlFor="cantidad">Cantidad*:</label>
        <input
          type="number"
          id="cantidad"
          name="cantidad"
          value={formData.cantidad}
          onChange={handleChange}
          step="0.01"
          min="0"
        />
      </div>
      <div className="form-group-mpf">
        <label htmlFor="unidad">Unidad*:</label>
        <select
          id="unidad"
          name="unidad"
          value={formData.unidad}
          onChange={handleChange}
        >
          {unidadesDisponibles.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <div className="form-group-mpf">
        <label htmlFor="umbral_alerta">Umbral de Alerta*:</label>
        <input
          type="number"
          id="umbral_alerta"
          name="umbral_alerta"
          value={formData.umbral_alerta}
          onChange={handleChange}
          step="0.01"
          min="0"
        />
      </div>
      <div className="form-group-mpf">
        <label htmlFor="proveedor_id">ID Proveedor (opcional):</label>
        <input
          type="text" // O number si siempre es numérico y quieres validación del navegador
          id="proveedor_id"
          name="proveedor_id"
          value={formData.proveedor_id || ''} // Controlar para que no sea null en el input
          onChange={handleChange}
        />
      </div>
      <div className="form-group-mpf">
        <label htmlFor="fecha_expiracion">Fecha de Expiración (opcional):</label>
        <input
          type="date"
          id="fecha_expiracion"
          name="fecha_expiracion"
          value={formData.fecha_expiracion || ''} // Controlar para que no sea null en el input
          onChange={handleChange}
        />
      </div>

      <div className="form-buttons-mpf">
        <button type="submit">{isEditMode ? 'Actualizar Materia Prima' : 'Guardar Materia Prima'}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
};

export default MateriaPrimaForm;