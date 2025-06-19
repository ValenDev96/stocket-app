import React, { useEffect, useState } from "react";
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "../../services/clientesService";
import { Button, Table, Modal, Form, Alert } from "react-bootstrap";
import { FaEdit, FaCopy, FaTrash } from "react-icons/fa";

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

  // Función para cargar clientes
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

  // Función para editar cliente
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

  // Función para copiar cliente
  const handleCopy = (cliente) => {
    setModalMode("crear");
    setClienteSeleccionado(null);
    setNuevoCliente({
      nombre: `${cliente.nombre} (Copia)`,
      informacion_contacto: cliente.informacion_contacto || "",
      direccion: cliente.direccion || "",
      preferencias: cliente.preferencias || "",
    });
    setShowModal(true);
  };

  // Función para eliminar cliente
  const handleDelete = (cliente) => {
    setClienteSeleccionado(cliente);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmarEliminacion = async () => {
    setLoading(true);
    setError("");

    try {
      await eliminarCliente(clienteSeleccionado.id);

      // Actualizar el estado local removiendo el cliente eliminado
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

  const handleInputChange = (e) => {
    setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
  };

  // Función para guardar cliente (crear o actualizar)
  const handleGuardarCliente = async () => {
    setLoading(true);
    setError("");

    try {
      // Validar campos requeridos
      if (!nuevoCliente.nombre.trim()) {
        setError("El nombre es requerido");
        setLoading(false);
        return;
      }

      if (modalMode === "editar") {
        // Actualizar cliente existente
        const clienteActualizado = await actualizarCliente(
          clienteSeleccionado.id,
          nuevoCliente
        );

        // Actualizar el estado local
        setClientes(
          clientes.map((c) =>
            c.id === clienteSeleccionado.id
              ? { ...clienteActualizado, id: clienteSeleccionado.id }
              : c
          )
        );
      } else {
        // Crear nuevo cliente
        const clienteCreado = await crearCliente(nuevoCliente);
        setClientes([...clientes, clienteCreado]);
      }

      // Limpiar y cerrar modal
      handleCloseModal();

      // Opcional: Recargar la lista completa para asegurar sincronización
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

  return (
    <div className="card shadow p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Gestión de Clientes</h4>
        <Button variant="primary" onClick={handleCreateNew}>
          + Crear Cliente
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Información de Contacto</th>
            <th>Dirección</th>
            <th>Preferencias</th>
            <th>Acciones</th>
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
              <td>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleEdit(cliente)}
                  >
                    <FaEdit /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopy(cliente)}
                  >
                    <FaCopy /> Copiar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(cliente)}
                  >
                    <FaTrash /> Borrar
                  </Button>
                </div>
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
      </Table>

      {/* Modal para crear/editar cliente */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "editar" ? "Editar Cliente" : "Crear Cliente"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={nuevoCliente.nombre}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Información de Contacto</Form.Label>
              <Form.Control
                type="text"
                name="informacion_contacto"
                value={nuevoCliente.informacion_contacto}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={nuevoCliente.direccion}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferencias</Form.Label>
              <Form.Control
                type="text"
                name="preferencias"
                value={nuevoCliente.preferencias}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleGuardarCliente}
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : modalMode === "editar"
              ? "Actualizar"
              : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>
            ¿Estás seguro de que deseas eliminar el cliente{" "}
            <strong>{clienteSeleccionado?.nombre}</strong>?
          </p>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmarEliminacion}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClientesCrud;
