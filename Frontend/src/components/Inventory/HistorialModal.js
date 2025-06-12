// Contenido para: Frontend/src/components/Inventory/HistorialModal.js

import React from 'react';

const HistorialModal = ({ isOpen, onClose, historial, materiaPrimaNombre, cargando }) => {
  if (!isOpen) return null;

  return (
    <div className="modal" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Historial de Movimientos: {materiaPrimaNombre}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {cargando ? (
              <p>Cargando historial...</p>
            ) : historial.length > 0 ? (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map(mov => (
                    <tr key={mov.id}>
                      <td>{new Date(mov.fecha_movimiento).toLocaleString()}</td>
                      <td>{mov.tipo_movimiento}</td>
                      <td>{mov.cantidad}</td>
                      <td>{mov.nombre_usuario || 'Sistema'}</td>
                      <td>{mov.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay movimientos registrados para esta materia prima.</p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialModal;