// Contenido para el nuevo archivo: Frontend/src/components/Inventory/GestionLotesModal.js

import React, { useState, useEffect } from 'react';
import { obtenerLotesPorMateriaPrima, descartarLote } from '../../services/lotesService';

const GestionLotesModal = ({ isOpen, onClose, materiaPrima, onLoteDescartado }) => {
  const [lotes, setLotes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && materiaPrima) {
      const fetchLotes = async () => {
        setCargando(true);
        setError('');
        try {
          const data = await obtenerLotesPorMateriaPrima(materiaPrima.id);
          setLotes(data);
        } catch (err) {
          setError(err.message || 'No se pudieron cargar los lotes.');
        } finally {
          setCargando(false);
        }
      };
      fetchLotes();
    }
  }, [isOpen, materiaPrima]);

  const handleDescartar = async (loteId) => {
    if (window.confirm(`¿Estás seguro de que deseas descartar el lote #${loteId}? Esta acción ajustará el stock.`)) {
      try {
        const response = await descartarLote(loteId);
        alert(response.message); // Muestra mensaje de éxito
        onLoteDescartado(); // Llama a la función del padre para cerrar y recargar
      } catch (err) {
        setError(err.message || 'Error al descartar el lote.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Gestionar Lotes de: {materiaPrima?.nombre}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {cargando && <p>Cargando lotes...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!cargando && (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Lote</th>
                    <th>Stock del Lote</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.length > 0 ? lotes.map(lote => (
                    <tr key={lote.id}>
                      <td>{lote.id}</td>
                      <td>{lote.stock_lote}</td>
                      <td>{new Date(lote.fecha_expiracion).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDescartar(lote.id)} 
                          className="btn btn-danger btn-sm"
                        >
                          Descartar Lote
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4">No hay lotes activos para esta materia prima.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionLotesModal;