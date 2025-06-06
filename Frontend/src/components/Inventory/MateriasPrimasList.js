import React from 'react';

// ANOTACIÓN: Se importan los iconos de la librería 'react-icons'.
import { FaPencilAlt, FaTrash, FaArrowCircleDown, FaArrowCircleUp } from 'react-icons/fa';

// ANOTACIÓN: Se preserva toda la lógica de props que ya tenías.
const MateriasPrimasList = ({ materiasPrimas, onEdit, onDelete, onRegistrarEntrada, onRegistrarSalida, puedeModificarInventario }) => {

  if (!materiasPrimas || materiasPrimas.length === 0) {
    return <p className="no-data-message-mpl">No hay materias primas registradas para mostrar.</p>;
  }
  
  // ANOTACIÓN: Pequeña función de ayuda para formatear la fecha de forma segura.
  const formatFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    try {
      return new Date(fechaISO).toLocaleDateString();
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="materias-primas-list">
      <h3 className="mpl-title">Listado de Materias Primas</h3>
      <table className="mpl-table">
        <thead>
          <tr>
            {/* ANOTACIÓN: Se mantienen todas las columnas de tu tabla original. */}
            <th>ID</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Umbral Alerta</th>
            <th>Expiración</th>
            <th>Proveedor ID</th>
            {/* La lógica para mostrar/ocultar la columna de acciones se mantiene intacta. */}
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
              <td data-label="Expiración">{formatFecha(mp.fecha_expiracion)}</td>
              <td data-label="Proveedor ID">{mp.proveedor_id || 'N/A'}</td>
              
              {(onEdit || onDelete || (puedeModificarInventario && (onRegistrarEntrada || onRegistrarSalida))) && (
                <td data-label="Acciones" className="mpl-actions">
                  {/*
                    ANOTACIÓN: INICIO DE LA SECCIÓN DE BOTONES MODIFICADA
                    - Se reemplazan los botones de texto por los nuevos con iconos.
                    - Se usa la clase 'mpl-actions-btn' para el estilo base circular.
                    - Se añade un 'title' para el tooltip de accesibilidad.
                    - Se quitan los estilos en línea, ya que ahora se manejan por CSS.
                    - La lógica de permisos 'puedeModificarInventario' se mantiene igual.
                  */}
                  
                  {puedeModificarInventario && onRegistrarEntrada && (
                    <button onClick={() => onRegistrarEntrada(mp)} className="mpl-actions-btn entrada-btn" title="Registrar Entrada">
                      <FaArrowCircleDown />
                    </button>
                  )}

                  {puedeModificarInventario && onRegistrarSalida && (
                    <button onClick={() => onRegistrarSalida(mp)} className="mpl-actions-btn salida-btn" title="Registrar Salida">
                      <FaArrowCircleUp />
                    </button>
                  )}

                  {onEdit && puedeModificarInventario && (
                    <button onClick={() => onEdit(mp)} className="mpl-actions-btn edit-btn" title="Editar">
                       <FaPencilAlt />
                    </button>
                  )}

                  {onDelete && puedeModificarInventario && (
                    <button onClick={() => onDelete(mp.id)} className="mpl-actions-btn delete-btn" title="Eliminar">
                      <FaTrash />
                    </button>
                  )}
                  {/* ANOTACIÓN: FIN DE LA SECCIÓN DE BOTONES MODIFICADA */}
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