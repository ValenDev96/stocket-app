
import React, { useState, useEffect } from 'react';

const STATIC_INITIAL_FORM_STATE = {
  nombre: '',
  proveedor_id: '', // Siempre inicializar como string vacío
  cantidad: '',
  unidad: 'kg',
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
        // Convertir proveedor_id a string para el estado del formulario
        proveedor_id: initialData.proveedor_id !== null && initialData.proveedor_id !== undefined ? String(initialData.proveedor_id) : '',
        cantidad: initialData.cantidad || '',
        unidad: initialData.unidad || 'kg',
        fecha_expiracion: initialData.fecha_expiracion ? initialData.fecha_expiracion.split('T')[0] : '',
        umbral_alerta: initialData.umbral_alerta || '',
      });
    } else {
      setFormData(STATIC_INITIAL_FORM_STATE);
    }
    setError('');
    setSuccessMessage('');
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value, // El valor de un input es siempre un string
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.nombre.trim() || formData.cantidad === '' || !formData.unidad || formData.umbral_alerta === '') {
      setError('Los campos marcados con * (nombre, cantidad, unidad y umbral de alerta) son obligatorios.');
      return;
    }
    if (parseFloat(formData.cantidad) < 0 || parseFloat(formData.umbral_alerta) < 0) {
      setError('Cantidad y umbral de alerta no pueden ser negativos.');
      return;
    }

    try {
      const trimmedProveedorId = formData.proveedor_id.trim(); // .trim() ahora es seguro porque formData.proveedor_id es un string

      const dataToSend = {
        ...formData, // Incluye todos los campos del formulario (nombre, unidad, etc.)
        cantidad: parseFloat(formData.cantidad),
        umbral_alerta: parseFloat(formData.umbral_alerta),
        // Si después de trim, proveedor_id es un string vacío, enviar null. Sino, enviar el valor con trim.
        // Si proveedor_id debe ser numérico en el backend, puedes convertirlo aquí:
        // proveedor_id: trimmedProveedorId ? Number(trimmedProveedorId) : null,
        // O dejarlo como string si tu backend maneja la conversión o espera un string:
        proveedor_id: trimmedProveedorId ? trimmedProveedorId : null,
        fecha_expiracion: formData.fecha_expiracion ? formData.fecha_expiracion : null,
      };

      await onSubmit(dataToSend);
      setSuccessMessage(isEditMode ? 'Materia prima actualizada con éxito!' : 'Materia prima creada con éxito!');
      
      if (!isEditMode) {
        setFormData(STATIC_INITIAL_FORM_STATE);
      }
    } catch (err) {
      console.error("Error en handleSubmit de MateriaPrimaForm:", err);
      setError(err.message || (isEditMode ? 'Error al actualizar la materia prima.' : 'Error al crear la materia prima.'));
    }
  };

  const unidadesDisponibles = ['kg', 'g', 'L', 'ml', 'unidades'];

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
          type="text" // Se mantiene como text para flexibilidad, la conversión a número se puede hacer antes de enviar si es necesario
          id="proveedor_id"
          name="proveedor_id"
          value={formData.proveedor_id} // formData.proveedor_id ahora es siempre un string
          onChange={handleChange}
        />
      </div>
      <div className="form-group-mpf">
        <label htmlFor="fecha_expiracion">Fecha de Expiración (opcional):</label>
        <input
          type="date"
          id="fecha_expiracion"
          name="fecha_expiracion"
          value={formData.fecha_expiracion} // formData.fecha_expiracion es un string
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