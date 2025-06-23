import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { obtenerHoras, eliminarHora } from '../../services/horasTrabajadasService'; // Asumiendo que el servicio se llama así
import { formatQuantity } from '../../utils/formatters';
import Swal from 'sweetalert2';
import '../../styles/providers.css'; // Reutilizamos los estilos
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const HorasTrabajadas = () => {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    // Podríamos añadir un modal para crear/editar en el futuro
    // const [showModal, setShowModal] = useState(false);

    const fetchHorasTrabajadas = useCallback(async () => {
        try {
            setLoading(true);
            // Como esta vista ahora es solo para el Admin, siempre obtenemos todos los registros
            const data = await obtenerHoras();
            setRegistros(data);
        } catch (error) {
            toast.error(error.message || 'No se pudieron cargar los registros.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHorasTrabajadas();
    }, [fetchHorasTrabajadas]);

    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await eliminarHora(id);
                    toast.success('Registro eliminado.');
                    fetchHorasTrabajadas(); // Recargamos la lista
                } catch (error) {
                    toast.error(error.message || 'Error al eliminar el registro.');
                }
            }
        });
    };
    
    // Función de marcador de posición para la edición
    const handleEditar = (registro) => {
        toast.info(`Funcionalidad de editar para el registro #${registro.id} pendiente.`);
        // Aquí se abriría el modal para la edición
    };

    // Función de marcador de posición para crear
    const handleCrear = () => {
        toast.info('Funcionalidad de crear nuevo registro pendiente.');
        // Aquí se abriría el modal para la creación
    }

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="gestion-proveedores-page">
            <div className="page-header-modern">
                <h2>Gestión de Horas de Trabajo</h2>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleCrear}>
                    <FaPlus />
                    Nueva Hora de Trabajo
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover table-modern table-bordered">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Fecha</th>
                            <th>Hora Inicio</th>
                            <th>Hora Fin</th>
                            <th>Total Horas</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.length > 0 ? (
                            registros.map((registro) => (
                                <tr key={registro.id}>
                                    {/* --- CORRECCIÓN AQUÍ --- */}
                                    {/* Usamos 'nombre_usuario', que es el campo correcto que viene del backend */}
                                    <td>{registro.nombre_usuario || 'No disponible'}</td>
                                    
                                    <td>{new Date(registro.fecha).toLocaleDateString()}</td>
                                    <td>{registro.hora_inicio}</td>
                                    <td>{registro.hora_fin || 'N/A'}</td>
                                    <td>{registro.total_horas ? formatQuantity(registro.total_horas) : 'N/A'}</td>
                                    <td className="text-center">
                                        <button className="circular-icon-button yellow" title="Editar" onClick={() => handleEditar(registro)}>
                                            <FaEdit />
                                        </button>
                                        <button className="circular-icon-button red" title="Eliminar" onClick={() => handleEliminar(registro.id)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No hay registros de horas trabajadas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HorasTrabajadas;