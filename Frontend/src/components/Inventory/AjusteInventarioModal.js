// Contenido corregido para: Frontend/src/components/Inventory/AjusteInventarioModal.js

import React, { useState, useEffect } from 'react';
// --- CORRECCIÓN ---
// Se importa la función del nuevo servicio de lotes en lugar de usar 'api' directamente.
import { obtenerLotesPorMateriaPrima } from '../../services/lotesService';
import { registrarMovimientoInventario } from '../../services/inventarioService'; // Asumimos que tienes esta función

const AjusteInventarioModal = ({ isOpen, onClose, materiaPrima, onAjusteExitoso }) => {
  const [lotes, setLotes] = useState([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('ajuste_disminucion');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [cargandoLotes, setCargandoLotes] = useState(false);

  useEffect(() => {
    if (isOpen && materiaPrima) {
      const fetchLotes = async () => {
        setCargandoLotes(true);
        setError('');
        try {
          // --- CORRECCIÓN ---
          // Ahora usamos la función de servicio que sí envía el token.
          const data = await obtenerLotesPorMateriaPrima(materiaPrima.id);
          setLotes(data);
        } catch (err) {
          console.error(err);
          setError(err.message || 'No se pudieron cargar los lotes.');
        } finally {
          setCargandoLotes(false);
        }
      };
      fetchLotes();
    } else {
      setLotes([]);
      setLoteSeleccionado('');
      setCantidad('');
      setDescripcion('');
      setError('');
    }
  }, [isOpen, materiaPrima]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loteSeleccionado || !cantidad || !descripcion) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setError('');

    try {
      const movimientoData = {
        lote_id: parseInt(loteSeleccionado, 10),
        tipo_movimiento: tipoMovimiento,
        cantidad: parseFloat(cantidad),
        descripcion: descripcion
      };
      // La función para registrar el movimiento debe estar en tu inventarioService
      await registrarMovimientoInventario(movimientoData);
      onAjusteExitoso();
    } catch (err) {
      setError(err.message || 'Error al registrar el ajuste.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Ajuste de Inventario: {materiaPrima?.nombre}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Lote a Ajustar</label>
                {cargandoLotes ? <p>Cargando lotes...</p> : (
                  <select className="form-select" value={loteSeleccionado} onChange={(e) => setLoteSeleccionado(e.target.value)} required>
                    <option value="">Seleccione un lote</option>
                    {lotes.map(lote => (
                      <option key={lote.id} value={lote.id}>
                        Lote #{lote.id} (Stock: {lote.stock_lote}, Vence: {new Date(lote.fecha_expiracion).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Tipo de Ajuste</label>
                <select className="form-select" value={tipoMovimiento} onChange={(e) => setTipoMovimiento(e.target.value)}>
                  <option value="ajuste_disminucion">Disminución (Merma, Pérdida)</option>
                  <option value="ajuste_aumento">Aumento (Sobrante, Corrección)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Cantidad a Ajustar</label>
                <input type="number" className="form-control" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required min="0.01" step="0.01" />
              </div>
              <div className="mb-3">
                <label className="form-label">Motivo del Ajuste (Descripción)</label>
                <textarea className="form-control" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Registrar Ajuste</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjusteInventarioModal;