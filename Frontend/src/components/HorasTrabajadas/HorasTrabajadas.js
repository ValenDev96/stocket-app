import React, { useState, useEffect, useCallback } from 'react';
import { horasTrabajadasService } from '../../services/horasTrabajadasService';
import { useAuth } from '../../context/AuthContext';
import { Button, Table, Modal, Form, Alert, Card } from 'react-bootstrap';
import '../../styles/horasTrabajas.css';

const HorasTrabajadas = () => {
    const { usuario } = useAuth();
    const [horasTrabajadas, setHorasTrabajadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingHora, setEditingHora] = useState(null);
    const [formData, setFormData] = useState({
        usuario_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        descripcion: ''
    });

    // Verificar si el usuario es admin
    const esAdmin = usuario?.rol_nombre === 'Administrador';

    const cargarHorasTrabajadas = useCallback(async () => {
        try {
            setLoading(true);
            let data;
            if (esAdmin) {
                // Admin ve todas las horas de trabajo
                data = await horasTrabajadasService.obtenerTodas();
            } else {
                // Otros roles solo ven sus propias horas
                data = await horasTrabajadasService.obtenerPorUsuario(usuario.id);
            }
            setHorasTrabajadas(data);
        } catch (error) {
            console.error('Error al cargar horas de trabajo:', error);
            setError('Error al cargar las horas de trabajo');
        } finally {
            setLoading(false);
        }
    }, [esAdmin, usuario?.id]);

    useEffect(() => {
        cargarHorasTrabajadas();
    }, [cargarHorasTrabajadas]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Para usuarios no admin, siempre usar su propio ID
            const dataToSend = {
                ...formData,
                usuario_id: esAdmin ? formData.usuario_id : usuario.id
            };

            if (editingHora) {
                await horasTrabajadasService.actualizar(editingHora.id, dataToSend);
            } else {
                await horasTrabajadasService.crear(dataToSend);
            }
            await cargarHorasTrabajadas();
            handleCloseModal();
        } catch (error) {
            console.error('Error al guardar:', error);
            setError('Error al guardar la hora de trabajo');
        }
    };

    const handleEdit = (hora) => {
        setEditingHora(hora);
        setFormData({
            usuario_id: hora.usuario_id,
            fecha: hora.fecha,
            hora_inicio: hora.hora_inicio,
            hora_fin: hora.hora_fin,
            descripcion: hora.descripcion || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta hora de trabajo?')) {
            try {
                await horasTrabajadasService.eliminar(id);
                await cargarHorasTrabajadas();
            } catch (error) {
                console.error('Error al eliminar:', error);
                setError('Error al eliminar la hora de trabajo');
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingHora(null);
        setFormData({
            usuario_id: esAdmin ? '' : usuario.id,
            fecha: '',
            hora_inicio: '',
            hora_fin: '',
            descripcion: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) return <div className="loading">Cargando...</div>;

    return (
        <div className="horas-trabajo-container">
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0">
                            {esAdmin ? 'Gestión de Horas de Trabajo - Todas' : 'Mis Horas de Trabajo'}
                        </h4>
                        <Button 
                            variant="primary"
                            onClick={() => {
                                setFormData({
                                    usuario_id: esAdmin ? '' : usuario.id,
                                    fecha: '',
                                    hora_inicio: '',
                                    hora_fin: '',
                                    descripcion: ''
                                });
                                setShowModal(true);
                            }}
                        >
                            <i className="fas fa-plus me-1"></i>
                            Nueva Hora de Trabajo
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}

                    <Table striped bordered hover responsive className="table-container">
                        <thead className="table-dark">
                            <tr>
                                {esAdmin && <th>Usuario</th>}
                                <th>Fecha</th>
                                <th>Hora Inicio</th>
                                <th>Hora Fin</th>
                                <th>Total Horas</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {horasTrabajadas.map(hora => (
                                <tr key={hora.id}>
                                    {esAdmin && (
                                        <td>{hora.usuario_nombre || `Usuario ${hora.usuario_id}`}</td>
                                    )}
                                    <td>{new Date(hora.fecha).toLocaleDateString()}</td>
                                    <td>{hora.hora_inicio}</td>
                                    <td>{hora.hora_fin}</td>
                                    <td>{hora.total_horas || 'N/A'}</td>
                                    <td>{hora.descripcion || '-'}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="warning"
                                                onClick={() => handleEdit(hora)}
                                                title="Editar"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(hora.id)}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {horasTrabajadas.length === 0 && (
                                <tr>
                                    <td colSpan={esAdmin ? "7" : "6"} className="text-center text-muted">
                                        No hay horas de trabajo registradas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingHora ? 'Editar' : 'Nueva'} Hora de Trabajo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {esAdmin ? (
                            <Form.Group className="mb-3">
                                <Form.Label>Usuario ID:</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="usuario_id"
                                    value={formData.usuario_id}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ingrese el ID del usuario"
                                />
                            </Form.Group>
                        ) : (
                            <div className="mb-3">
                                <Form.Label>Registrando horas para:</Form.Label>
                                <div className="alert alert-info d-flex align-items-center">
                                    <i className="fas fa-user me-2"></i>
                                    <strong>{usuario.nombre || usuario.email || 'Mi cuenta'}</strong>
                                </div>
                            </div>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Fecha:</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Hora Inicio:</Form.Label>
                            <Form.Control
                                type="time"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Hora Fin:</Form.Label>
                            <Form.Control
                                type="time"
                                name="hora_fin"
                                value={formData.hora_fin}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción:</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Describe las actividades realizadas..."
                            />
                        </Form.Group>
                        
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit">
                                {editingHora ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default HorasTrabajadas;