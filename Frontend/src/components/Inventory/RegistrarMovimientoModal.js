import React, { useState, useEffect } from 'react';
import '../../styles/InventoryModal.css'; // <-- IMPORTA TU ARCHIVO Modal.css

const RegistrarMovimientoModal = ({ isOpen, onClose, materiaPrima, tipoMovimientoDefault, onSubmit }) => {
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState(tipoMovimientoDefault || 'entrada');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCantidad('');
      setDescripcion('');
      setTipoMovimiento(tipoMovimientoDefault || 'entrada');
      setError('');
    }
  }, [isOpen, tipoMovimientoDefault, materiaPrima]);

  if (!isOpen || !materiaPrima) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!cantidad || isNaN(parseFloat(cantidad)) || parseFloat(cantidad) <= 0) {
      setError('La cantidad debe ser un número positivo.');
      return;
    }

    const movimientoData = {
      materia_prima_id: materiaPrima.id,
      tipo_movimiento: tipoMovimiento,
      cantidad: parseFloat(cantidad),
      descripcion: descripcion.trim() || `Movimiento de ${tipoMovimiento} para ${materiaPrima.nombre}`,
    };

    try {
      await onSubmit(movimientoData);
      onClose(); 
    } catch (err) {
      console.error("Error en handleSubmit del modal:", err);
      setError(err.message || 'Error al registrar el movimiento.');
    }
  };

  return (
    <div className="modal-backdrop"> {/* Usa la clase del CSS */}
      <div className="modal-content"> {/* Usa la clase del CSS */}
        <div className="modal-header">
          <h3 className="modal-title"> {/* Usa la clase del CSS */}
            Registrar Movimiento: {materiaPrima.nombre} ({tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida'})
          </h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Cerrar modal">&times;</button>
        </div>
        
        {error && <p className="modal-error-message">{error}</p>} {/* Usa la clase del CSS */}

        {/* Puedes añadir la clase modal-body al form si definiste estilos para ella */}
        <form onSubmit={handleSubmit} className="modal-body"> 
          <div className="modal-form-group"> {/* Usa la clase del CSS */}
            <label htmlFor="tipoMovimiento">Tipo de Movimiento:</label>
            <select
              id="tipoMovimiento"
              name="tipoMovimiento"
              value={tipoMovimiento}
              onChange={(e) => setTipoMovimiento(e.target.value)}
              disabled={!!tipoMovimientoDefault}
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </div>

          <div className="modal-form-group"> {/* Usa la clase del CSS */}
            <label htmlFor="cantidadMovimiento">Cantidad* ({materiaPrima.unidad}):</label>
            <input
              type="number"
              id="cantidadMovimiento"
              name="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              step="0.01"
              min="0.01"
              required
              autoFocus
            />
          </div>

          <div className="modal-form-group"> {/* Usa la clase del CSS */}
            <label htmlFor="descripcionMovimiento">Descripción (Opcional):</label>
            <input
              type="text"
              id="descripcionMovimiento"
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Compra a Proveedor X, Uso en Lote Y"
            />
          </div>

          <div className="modal-form-buttons"> {/* Usa la clase del CSS */}
            <button type="submit">Registrar Movimiento</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarMovimientoModal;
