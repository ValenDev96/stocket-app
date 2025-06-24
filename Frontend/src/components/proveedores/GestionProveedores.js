import React, { useEffect, useState } from 'react';
import ProveedorForm from './ProveedorForm';
import {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  inactivarProveedor,
  activarProveedor
} from '../../services/proveedoresService';
import { toast } from 'react-toastify';
import '../../styles/providers.css';

const GestionProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProveedorId, setEditingProveedorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (err) {
      toast.error('Error al obtener proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id) => {
    setEditingProveedorId(id);
    setShowFormModal(true);
  };

  const handleAddClick = () => {
    setEditingProveedorId(null);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingProveedorId(null);
  };

  const handleInactivar = async (id) => {
    try {
      await inactivarProveedor(id);
      toast.info('Proveedor inactivado');
      fetchProveedores();
    } catch (err) {
      toast.error('Error al inactivar proveedor');
    }
  };

  const handleActivar = async (id) => {
    try {
      await activarProveedor(id);
      toast.success('Proveedor activado');
      fetchProveedores();
    } catch (err) {
      toast.error('Error al activar proveedor');
    }
  };

  return (
    <div className="gestion-proveedores-page">
      <div className="page-header-modern">
        <h2>Gestión de Proveedores</h2>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <i className="fas fa-plus me-2"></i>Nuevo Proveedor
        </button>
      </div>

      {loading ? (
        <div className="text-center p-4">Cargando proveedores...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((proveedor) => (
                <tr key={proveedor.id}>
                  <td>{proveedor.id}</td>
                  <td>{proveedor.nombre}</td>
                  <td>{proveedor.informacion_contacto}</td>
                  <td>{proveedor.direccion}</td>
                  <td>
                    {proveedor.is_active ? (
                      <span className="badge bg-success">Activo</span>
                    ) : (
                      <span className="badge bg-danger">Inactivo</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleEditClick(proveedor.id)}
                      className="circular-icon-button yellow"
                      title="Editar"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {proveedor.is_active ? (
                      <button
                        onClick={() => handleInactivar(proveedor.id)}
                        className="circular-icon-button red"
                        title="Inactivar"
                      >
                        <i className="fas fa-ban"></i>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivar(proveedor.id)}
                        className="circular-icon-button green"
                        title="Activar"
                      >
                        <i className="fas fa-check-circle"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {proveedores.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">
                    No hay proveedores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal con ProveedorForm */}
      {showFormModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingProveedorId ? 'Editar Proveedor' : 'Registrar Proveedor'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <ProveedorForm
                  proveedorId={editingProveedorId}
                  onClose={handleCloseModal}
                  onSave={fetchProveedores}
                  crearProveedor={crearProveedor}
                  editarProveedor={actualizarProveedor}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionProveedores;
