// Contenido corregido para: Frontend/src/components/Admin/GestionUsuarios.js

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getUsers, deleteUser } from '../../services/adminService';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../../styles/providers.css'; // Asegúrate de tener un CSS para estilos específicos

// Importamos el formulario y el modal
import CrearUsuario from './CrearUsuario';
import { Modal } from 'react-bootstrap';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // --- NUEVOS ESTADOS PARA CONTROLAR EL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // null para crear, objeto para editar

  const fetchUsers = useCallback(async () => {
    try {
      // No necesitamos poner cargando en true aquí para evitar parpadeo al recargar
      const data = await getUsers();
      setUsuarios(data);
    } catch (error) {
      toast.error('No se pudieron cargar los usuarios.');
    } finally {
      // Solo ponemos cargando en false la primera vez
      if (cargando) setCargando(false);
    }
  }, [cargando]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = (usuario) => {
    // ... (esta función se queda igual)
    Swal.fire({
      title: `¿Estás seguro de eliminar a ${usuario.nombre_usuario}?`, text: "Esta acción no se puede deshacer.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sí, ¡eliminar!', cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser(usuario.id);
          toast.success('Usuario eliminado correctamente.');
          fetchUsers();
        } catch (error) {
          toast.error(error.message || 'Error al eliminar el usuario.');
        }
      }
    });
  };

  // --- NUEVAS FUNCIONES PARA MANEJAR EL MODAL ---
  const handleEdit = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowModal(true);
  };

  const handleCreate = () => {
    setUsuarioSeleccionado(null); // Aseguramos que no hay un usuario seleccionado
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setUsuarioSeleccionado(null);
  };


  if (cargando) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="gestion-proveedores-page">
      <div className="page-header-modern">
        <h2>Gestión de Usuarios</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleCreate}>
          <FaPlus />
          Crear Usuario
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-modern table-bordered">
          {/* ... (la tabla se queda igual, solo cambia el onClick de editar) ... */}
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{`${user.nombre_usuario} ${user.apellido || ''}`}</td>
                <td>{user.email}</td>
                <td>{user.nombre_rol}</td>
                <td>
                  <span className={`badge bg-${user.activo ? 'success' : 'secondary'}`}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="text-center">
                  <button className="circular-icon-button yellow" title="Editar" onClick={() => handleEdit(user)}>
                    <FaEdit />
                  </button>
                  <button className="circular-icon-button red" title="Eliminar" onClick={() => handleDelete(user)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL PARA CREAR Y EDITAR --- */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {usuarioSeleccionado ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CrearUsuario 
            usuarioAEditar={usuarioSeleccionado}
            onFormSubmit={fetchUsers} // Pasamos la función para recargar la tabla
            onClose={handleCloseModal} // Pasamos la función para cerrar el modal
          />
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default GestionUsuarios;