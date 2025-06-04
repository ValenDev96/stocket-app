// Frontend/src/components/Inventory/MateriasPrimasList.js
import React from 'react';

const MateriasPrimasList = ({ materiasPrimas, onEdit, onDelete }) => {
  if (!materiasPrimas || materiasPrimas.length === 0) {
    return <p className="no-data-message-mpl">No hay materias primas registradas para mostrar.</p>;
  }

  return (
    <div className="materias-primas-list">
      <h3 className="mpl-title">Listado de Materias Primas</h3>
      <table className="mpl-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Umbral Alerta</th>
            <th>Expiración</th>
            <th>Proveedor ID</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materiasPrimas.map(mp => (
            <tr key={mp.id}>
              <td data-label="ID">{mp.id}</td>
              <td data-label="Nombre">{mp.nombre}</td>
              <td data-label="Cantidad">{mp.cantidad}</td>
              <td data-label="Unidad">{mp.unidad}</td>
              <td data-label="Umbral Alerta">{mp.umbral_alerta}</td>
              <td data-label="Expiración">{mp.fecha_expiracion ? new Date(mp.fecha_expiracion).toLocaleDateString() : 'N/A'}</td>
              <td data-label="Proveedor ID">{mp.proveedor_id || 'N/A'}</td>
              <td data-label="Acciones" className="mpl-actions">
                <button onClick={() => onEdit(mp)} className="edit-btn">Editar</button>
                <button onClick={() => onDelete(mp.id)} className="delete-btn">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MateriasPrimasList;