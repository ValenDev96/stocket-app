import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchRoles, registerUser } from '../../services/adminService';

const CrearUsuario = () => {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    apellido: '',
    email: '',
    password: '',
    rol_id: ''
  });
  const [roles, setRoles] = useState([]);
  const [cargandoRoles, setCargandoRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para cargar los roles desde la API
  const cargarRoles = useCallback(async () => {
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los roles.');
    } finally {
      setCargandoRoles(false);
    }
  }, []);

  // useEffect se ejecuta una vez cuando el componente se monta para cargar los roles
  useEffect(() => {
    cargarRoles();
  }, [cargarRoles]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rol_id) {
      toast.error('Por favor, selecciona un rol para el usuario.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await registerUser(formData);
      toast.success('¡Usuario creado exitosamente!');
      // Limpiar el formulario después del éxito
      setFormData({
        nombre_usuario: '',
        apellido: '',
        email: '',
        password: '',
        rol_id: ''
      });
    } catch (error) {
      toast.error(error.message || 'Error al crear el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Crear Nuevo Usuario</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="nombre_usuario" className="form-label">Nombre(s)</label>
            {/* --- CORRECCIÓN AQUÍ --- */}
            <input type="text" id="nombre_usuario" name="nombre_usuario" value={formData.nombre_usuario} onChange={handleChange} className="form-control" required autoComplete="given-name" />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="apellido" className="form-label">Apellido(s)</label>
            {/* --- CORRECCIÓN AQUÍ --- */}
            <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className="form-control" autoComplete="family-name" />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            {/* --- CORRECCIÓN AQUÍ --- */}
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-control" required autoComplete="email" />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            {/* --- CORRECCIÓN AQUÍ --- */}
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="form-control" required autoComplete="new-password" />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="rol_id" className="form-label">Rol del Usuario</label>
          <select id="rol_id" name="rol_id" value={formData.rol_id} onChange={handleChange} className="form-select" required disabled={cargandoRoles}>
            <option value="">{cargandoRoles ? 'Cargando roles...' : 'Selecciona un rol'}</option>
            {!cargandoRoles && roles.map(rol => (
              <option key={rol.id} value={rol.id}>{rol.nombre_rol}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creando Usuario...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
};

export default CrearUsuario;