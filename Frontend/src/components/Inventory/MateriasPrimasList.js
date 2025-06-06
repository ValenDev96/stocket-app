import React from 'react';
// Asegúrate de que los estilos de Inventory.css son importados donde se usa este componente
// o importa aquí si tienes estilos específicos para esta lista que no estén en Inventory.css

const MateriasPrimasList = ({ materiasPrimas, onEdit, onDelete, onRegistrarEntrada, onRegistrarSalida, puedeModificarInventario }) => {
  // puedeModificarInventario es un booleano que indica si el usuario tiene permiso para realizar acciones de modificación
  // como registrar entradas/salidas, editar o eliminar.

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
            {/* Solo mostrar la columna de Acciones si hay alguna acción disponible */}
            {(onEdit || onDelete || (puedeModificarInventario && (onRegistrarEntrada || onRegistrarSalida))) && (
              <th>Acciones</th>
            )}
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
              
              {/* Solo renderizar la celda de acciones si hay alguna acción permitida/disponible */}
              {(onEdit || onDelete || (puedeModificarInventario && (onRegistrarEntrada || onRegistrarSalida))) && (
                <td data-label="Acciones" className="mpl-actions">
                  {/* Botones de Entrada/Salida solo si puedeModificarInventario es true */}
                  {puedeModificarInventario && onRegistrarEntrada && (
                    <button onClick={() => onRegistrarEntrada(mp)} className="action-btn entrada-btn" style={{backgroundColor: '#5cb85c', color: 'white', marginRight: '5px'}}>
                      Entrada
                    </button>
                  )}
                  {puedeModificarInventario && onRegistrarSalida && (
                    <button onClick={() => onRegistrarSalida(mp)} className="action-btn salida-btn" style={{backgroundColor: '#f0ad4e', color: 'white', marginRight: '5px'}}>
                      Salida
                    </button>
                  )}
                  {/* Botones de Editar/Eliminar existentes (podrían también depender de puedeModificarInventario) */}
                  {onEdit && puedeModificarInventario && ( // Asumiendo que editar también requiere permiso de modificación
                    <button onClick={() => onEdit(mp)} className="edit-btn">Editar</button>
                  )}
                  {onDelete && puedeModificarInventario && ( // Asumiendo que eliminar también requiere permiso de modificación
                    <button onClick={() => onDelete(mp.id)} className="delete-btn">Eliminar</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MateriasPrimasList;