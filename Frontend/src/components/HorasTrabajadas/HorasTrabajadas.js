import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

// Servicios necesarios
import { obtenerHoras, registrarHora, actualizarHora, eliminarHora } from '../../services/horasTrabajadasService';
import { getUsers } from '../../services/adminService';

// Componentes de UI de React-Bootstrap
import { Button, Table, Modal, Form, Alert,Row, Col } from 'react-bootstrap';

// Estilos y formateadores
import '../../styles/providers.css';
import { formatQuantity } from '../../utils/formatters';

const HorasTrabajadas = () => {
    const [registros, setRegistros] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para manejar el modal y el formulario
    const [showModal, setShowModal] = useState(false);
    const [editingRegistro, setEditingRegistro] = useState(null);
    const [formData, setFormData] = useState({
        empleado_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
    });

    const cargarDatos = useCallback(async () => {
        try {
            // No establecemos loading a true aquí para evitar parpadeos en recargas
            const [dataHoras, dataEmpleados] = await Promise.all([
                obtenerHoras(),
                getUsers()
            ]);
            setRegistros(dataHoras);
            setEmpleados(dataEmpleados);
        } catch (error) {
            toast.error(error.message || 'No se pudieron cargar los datos.');
            setError('No se pudieron cargar los datos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // --- Lógica para el Modal ---
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRegistro(null);
        setFormData({ empleado_id: '', fecha: '', hora_inicio: '', hora_fin: '' });
    };

    const handleCrear = () => {
        setEditingRegistro(null);
        setFormData({ empleado_id: '', fecha: new Date().toISOString().split('T')[0], hora_inicio: '', hora_fin: '' });
        setShowModal(true);
    };

    const handleEditar = (registro) => {
        setEditingRegistro(registro);
        const fechaFormateada = new Date(registro.fecha).toISOString().split('T')[0];
        setFormData({
            empleado_id: registro.empleado_id,
            fecha: fechaFormateada,
            hora_inicio: registro.hora_inicio || '',
            hora_fin: registro.hora_fin || '',
        });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRegistro) {
                await actualizarHora(editingRegistro.id, formData);
                toast.success('Registro actualizado con éxito.');
            } else {
                await registrarHora(formData);
                toast.success('Nuevo registro de hora creado con éxito.');
            }
            handleCloseModal();
            cargarDatos();
        } catch (error) {
            toast.error(error.message || 'Error al guardar el registro.');
        }
    };

    const handleEliminar = (id) => {
        Swal.fire({
            title: '¿Estás seguro?', text: "No podrás revertir esta acción.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sí, ¡eliminar!', cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await eliminarHora(id);
                    toast.success('Registro eliminado.');
                    cargarDatos();
                } catch (error) {
                    toast.error(error.message || 'Error al eliminar el registro.');
                }
            }
        });
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="gestion-proveedores-page">
            <div className="page-header-modern">
                <h2>Gestión de Horas de Trabajo</h2>
                <Button variant="primary" onClick={handleCrear}>
                    <FaPlus className="me-1" /> Nueva Hora de Trabajo
                </Button>
            </div>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            <div className="table-responsive">
                <Table striped bordered hover className="table-modern">
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
                        {registros.map((registro) => (
                            <tr key={registro.id}>
                                <td>{registro.nombre_usuario || 'No disponible'}</td>
                                <td>{new Date(registro.fecha).toLocaleDateString()}</td>
                                <td>{registro.hora_inicio}</td>
                                <td>{registro.hora_fin || 'N/A'}</td>
                                <td>{registro.total_horas ? formatQuantity(registro.total_horas) : 'N/A'}</td>
                                <td className="text-center">
                                    <button className="circular-icon-button yellow" title="Editar" onClick={() => handleEditar(registro)}>
                                        <FaEdit />
                                    </button>
                                    <button className="circular-icon-button red" title="Borrar" onClick={() => handleEliminar(registro.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingRegistro ? 'Editar' : 'Nuevo'} Registro de Hora</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Empleado</Form.Label>
                            <Form.Select name="empleado_id" value={formData.empleado_id} onChange={handleInputChange} required>
                                <option value="">Seleccione un empleado...</option>
                                {empleados.map(emp => (
                                    <option key={emp.empleado_id} value={emp.empleado_id}>
                                        {emp.nombre_usuario}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required />
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Hora Inicio</Form.Label>
                                    <Form.Control type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleInputChange} required />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Hora Fin</Form.Label>
                                    <Form.Control type="time" name="hora_fin" value={formData.hora_fin} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                            <Button variant="primary" type="submit">Guardar</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default HorasTrabajadas;