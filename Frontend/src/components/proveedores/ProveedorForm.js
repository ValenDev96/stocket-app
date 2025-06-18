import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Asumimos que tendrás un servicio para proveedores, si no existe, deberás crearlo.
// import { crearProveedor } from '../../services/proveedoresService';

const ProveedorForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        informacion_contacto: '',
        direccion: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Aquí llamarías a la función del servicio para guardar en la BD.
            // Por ahora, simulamos una llamada exitosa.
            // await crearProveedor(formData); 
            console.log('Datos a enviar al backend:', formData);
            toast.success('¡Proveedor registrado exitosamente!');
            
            // Después de registrar, redirigimos al usuario a la página principal de proveedores.
            navigate('/providers'); 
        } catch (error) {
            toast.error(error.message || 'Error al registrar el proveedor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Registrar Nuevo Proveedor</h2>
            </div>
            {/* El formulario ahora sigue la estructura estándar de Bootstrap */}
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
                    <label htmlFor="informacion_contacto" className="form-label">Información de Contacto (Teléfono/Email)</label>
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
                    <label htmlFor="direccion" className="form-label">Dirección (Opcional)</label>
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

                {/* Botones de acción claros */}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar Proveedor'}
                </button>
                <button type="button" onClick={() => navigate('/providers')} className="btn btn-secondary ms-2">
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default ProveedorForm;