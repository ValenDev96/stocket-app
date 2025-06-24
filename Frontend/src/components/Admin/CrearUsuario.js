import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchRoles, registerUser, updateUser } from '../../services/adminService'; 

const CrearUsuario = ({ usuarioAEditar, onFormSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        nombre_usuario: '',
        apellido: '',
        email: '',
        password: '',
        rol_id: '',
        activo: 1
    });
    const [roles, setRoles] = useState([]);
    const [cargandoRoles, setCargandoRoles] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 1. AÑADIMOS UN ESTADO PARA EL ERROR DE EMAIL ---
    const [emailError, setEmailError] = useState('');

    const isEditMode = !!usuarioAEditar;

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                nombre_usuario: usuarioAEditar.nombre_usuario || '',
                apellido: usuarioAEditar.apellido || '',
                email: usuarioAEditar.email || '',
                password: '',
                rol_id: roles.find(r => r.nombre_rol === usuarioAEditar.nombre_rol)?.id || '',
                activo: usuarioAEditar.activo
            });
        }
    }, [usuarioAEditar, isEditMode, roles]);

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

    useEffect(() => {
        cargarRoles();
    }, [cargarRoles]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        });
        // Limpiamos el error cuando el usuario empieza a corregir
        if (name === 'email') {
            setEmailError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError(''); // Limpiamos errores anteriores

        // --- 2. AÑADIMOS LA LÓGICA DE VALIDACIÓN ---
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(formData.email)) {
            setEmailError('Por favor, ingresa una dirección de correo válida.');
            return; // Detenemos el envío
        }

        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await updateUser(usuarioAEditar.id, formData);
                toast.success('¡Usuario actualizado exitosamente!');
            } else {
                await registerUser(formData);
                toast.success('¡Usuario creado exitosamente!');
            }
            onFormSubmit();
            onClose();
        } catch (error) {
            toast.error(error.message || 'Ocurrió un error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // --- 3. AÑADIMOS 'noValidate' AL FORMULARIO ---
        <form noValidate onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="nombre_usuario" className="form-label">Nombre(s)</label>
                    <input type="text" id="nombre_usuario" name="nombre_usuario" value={formData.nombre_usuario} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="apellido" className="form-label">Apellido(s)</label>
                    <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className="form-control" />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className={`form-control ${emailError ? 'is-invalid' : ''}`}
                        required 
                    />
                    {/* --- 4. MOSTRAMOS EL MENSAJE DE ERROR PERSONALIZADO --- */}
                    {emailError && <div className="error-message">{emailError}</div>}
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className="form-control" 
                        placeholder={isEditMode ? 'Dejar en blanco para no cambiar' : ''}
                        required={!isEditMode}
                    />
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="rol_id" className="form-label">Rol del Usuario</label>
                <select id="rol_id" name="rol_id" value={formData.rol_id} onChange={handleChange} className="form-select" required disabled={cargandoRoles}>
                    <option value="">{cargandoRoles ? 'Cargando...' : 'Selecciona un rol'}</option>
                    {!cargandoRoles && roles.map(rol => <option key={rol.id} value={rol.id}>{rol.nombre_rol}</option>)}
                </select>
            </div>
            {isEditMode && (
                <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" role="switch" id="activo" name="activo" checked={formData.activo === 1} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="activo">Usuario Activo</label>
                </div>
            )}
            <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar Usuario' : 'Crear Usuario')}
                </button>
            </div>
        </form>
    );
};

export default CrearUsuario;