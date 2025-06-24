import React, { useEffect, useState } from "react";
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "../../services/clientesService";
// Componentes de React-Bootstrap que aún se usan para los modales
import { Button, Modal, Form, Alert } from "react-bootstrap"; 
// Se elimina FaCopy y se usarán botones personalizados en la tabla
import { FaEdit, FaTrash } from "react-icons/fa"; 
// Importamos los estilos modernos que ya creamos
import '../../styles/providers.css'; 

const ClientesCrud = () => {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState("crear"); // 'crear', 'editar'
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    informacion_contacto: "",
    direccion: "",
    preferencias: "",
  });

  // Función para cargar clientes (sin cambios)
  const fetchClientes = async () => {
    try {
      const response = await obtenerClientes();
      setClientes(response);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setError("Error al cargar los clientes");
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Función para editar cliente (sin cambios)
  const handleEdit = (cliente) => {
    setModalMode("editar");
    setClienteSeleccionado(cliente);
    setNuevoCliente({
      nombre: cliente.nombre,
      informacion_contacto: cliente.informacion_contacto || "",
      direccion: cliente.direccion || "",
      preferencias: cliente.preferencias || "",
    });
    setShowModal(true);
  };

  // --- SE ELIMINA LA FUNCIÓN handleCopy ---

  // Función para abrir modal de eliminación (sin cambios)
  const handleDelete = (cliente) => {
    setClienteSeleccionado(cliente);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación (sin cambios)
  const confirmarEliminacion = async () => {
    setLoading(true);
    setError("");
    try {
      await eliminarCliente(clienteSeleccionado.id);
      setClientes(clientes.filter((c) => c.id !== clienteSeleccionado.id));
      setShowDeleteModal(false);
      setClienteSeleccionado(null);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      setError("Error al eliminar el cliente. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Resto de funciones (handleInputChange, handleGuardarCliente, etc.) se mantienen igual...
  const handleInputChange = (e) => {
    setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
  };

  const handleGuardarCliente = async () => {
    setLoading(true);
    setError("");
    try {
      if (!nuevoCliente.nombre.trim()) {
        setError("El nombre es requerido");
        setLoading(false);
        return;
      }
      if (modalMode === "editar") {
        const clienteActualizado = await actualizarCliente(
          clienteSeleccionado.id,
          nuevoCliente
        );
        setClientes(
          clientes.map((c) =>
            c.id === clienteSeleccionado.id
              ? { ...clienteActualizado, id: clienteSeleccionado.id }
              : c
          )
        );
      } else {
        const clienteCreado = await crearCliente(nuevoCliente);
        setClientes([...clientes, clienteCreado]);
      }
      handleCloseModal();
      await fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setError(
        `Error al ${
          modalMode === "editar" ? "actualizar" : "crear"
        } el cliente. Por favor, intenta nuevamente.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setModalMode("crear");
    setClienteSeleccionado(null);
    setNuevoCliente({
      nombre: "",
      informacion_contacto: "",
      direccion: "",
      preferencias: "",
    });
  };

  const handleCreateNew = () => {
    setModalMode("crear");
    setClienteSeleccionado(null);
    setNuevoCliente({
      nombre: "",
      informacion_contacto: "",
      direccion: "",
      preferencias: "",
    });
    setShowModal(true);
  };
  
  // --- AHORA VIENE LA PARTE VISUAL (JSX) CORREGIDA ---
  return (
    <div className="gestion-proveedores-page"> {/* Se usan las clases modernas */}
      <div className="page-header-modern">
        <h2>Gestión de clientes</h2>
        <Button variant="primary" onClick={handleCreateNew}>
          + Crear Cliente
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="table-responsive">
        <table className="table table-hover table-modern">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Información de Contacto</th>
              <th>Dirección</th>
              <th>Preferencias</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.informacion_contacto || "N/A"}</td>
                <td>{cliente.direccion || "N/A"}</td>
                <td>{cliente.preferencias || "N/A"}</td>
                <td className="text-center"> {/* Centramos los botones */}
                  
                  {/* --- BOTONES CORREGIDOS --- */}
                  <button
                    className="circular-icon-button yellow"
                    title="Editar"
                    onClick={() => handleEdit(cliente)}
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="circular-icon-button red"
                    title="Borrar"
                    onClick={() => handleDelete(cliente)}
                  >
                    <FaTrash />
                  </button>

                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Los modales de react-bootstrap se mantienen sin cambios */}
      <Modal show={showModal} onHide={handleCloseModal}>
        {/* ... (código del modal de edición/creación sin cambios) */}
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === "editar" ? "Editar Cliente" : "Crear Cliente"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3"><Form.Label>Nombre *</Form.Label><Form.Control type="text" name="nombre" value={nuevoCliente.nombre} onChange={handleInputChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Información de Contacto</Form.Label><Form.Control type="text" name="informacion_contacto" value={nuevoCliente.informacion_contacto} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Dirección</Form.Label><Form.Control type="text" name="direccion" value={nuevoCliente.direccion} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Preferencias</Form.Label><Form.Control type="text" name="preferencias" value={nuevoCliente.preferencias} onChange={handleInputChange} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardarCliente} disabled={loading}>{loading ? "Guardando..." : modalMode === "editar" ? "Actualizar" : "Guardar"}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        {/* ... (código del modal de eliminación sin cambios) */}
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>¿Estás seguro de que deseas eliminar el cliente <strong>{clienteSeleccionado?.nombre}</strong>?</p>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminacion} disabled={loading}>{loading ? "Eliminando..." : "Eliminar"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClientesCrud;