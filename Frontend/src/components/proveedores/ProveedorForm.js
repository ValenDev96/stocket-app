import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProveedorById, crearProveedor, actualizarProveedor } from '../../services/proveedoresService';

const ProveedorForm = ({ proveedorId, onClose, onSave, onFormSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    informacion_contacto: '',
    direccion: '',
    is_active: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const cargarProveedor = async () => {
      if (!proveedorId) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const data = await getProveedorById(proveedorId);
        setFormData({
          nombre: data.nombre || '',
          informacion_contacto: data.informacion_contacto || '',
          direccion: data.direccion || '',
          is_active: data.is_active !== undefined ? data.is_active : true
        });
      } catch (err) {
        console.error('Error al cargar proveedor:', err);
        toast.error(err.message || 'Error al cargar datos del proveedor.');
        if (onClose) onClose();
      } finally {
        setLoadingData(false);
      }
    };

    cargarProveedor();
  }, [proveedorId, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (proveedorId) {
        await actualizarProveedor(proveedorId, formData);
        toast.success('Proveedor actualizado exitosamente');
      } else {
        await crearProveedor(formData);
        toast.success('Proveedor registrado exitosamente');
      }

      if (onSave) onSave();
      if (onClose) onClose();
      if (onFormSuccess) onFormSuccess();
    } catch (err) {
      console.error('Error al guardar proveedor:', err);
      toast.error(err.message || 'Error al guardar proveedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return <div className="text-center p-4">Cargando datos del proveedor...</div>;
  }

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre del Proveedor</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            className="form-control"
            value={formData.nombre}
            onChange={handleChange}
            required
            autoComplete="organization"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="informacion_contacto" className="form-label">Información de Contacto</label>
          <input
            type="text"
            id="informacion_contacto"
            name="informacion_contacto"
            className="form-control"
            value={formData.informacion_contacto}
            onChange={handleChange}
            required
            autoComplete="tel"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="direccion" className="form-label">Dirección</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            className="form-control"
            value={formData.direccion}
            onChange={handleChange}
            autoComplete="street-address"
          />
        </div>

        {proveedorId && (
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="is_active">
              Activo
            </label>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : proveedorId ? 'Actualizar Proveedor' : 'Registrar Proveedor'}
        </button>
        {onClose ? (
          <button type="button" className="btn btn-secondary ms-2" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
        ) : (
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/providers')} disabled={isSubmitting}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
};

export default ProveedorForm;
