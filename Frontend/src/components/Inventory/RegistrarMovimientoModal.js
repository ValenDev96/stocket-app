import React, { useState, useEffect } from 'react';
import '../../styles/InventoryModal.css';

const RegistrarMovimientoModal = ({ isOpen, onClose, materiaPrima, tipoMovimientoDefault, onSubmit }) => {
  // ANOTACIÓN: Se mantiene el estado solo para los campos que el usuario debe llenar.
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  
  // ANOTACIÓN: Se añade un estado para deshabilitar los botones durante el envío.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ANOTACIÓN: Se elimina el estado 'tipoMovimiento', ya que ahora es un valor fijo que viene de las props.
  useEffect(() => {
    if (isOpen) {
      // Limpia el formulario cada vez que el modal se abre.
      setCantidad('');
      setDescripcion('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]); // El efecto ahora solo depende de 'isOpen'.

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

    setIsSubmitting(true); // Deshabilita los botones

    const movimientoData = {
      materia_prima_id: materiaPrima.id,
      // ANOTACIÓN: Se usa 'tipoMovimientoDefault' directamente desde las props.
      tipo_movimiento: tipoMovimientoDefault,
      cantidad: parseFloat(cantidad),
      descripcion: descripcion.trim(),
    };

    try {
      await onSubmit(movimientoData);
      onClose(); 
    } catch (err) {
      console.error("Error en handleSubmit del modal:", err);
      setError(err.message || 'Error al registrar el movimiento.');
      setIsSubmitting(false); // Vuelve a habilitar los botones si hay un error
    }
  };

  return (
    // ANOTACIÓN: El backdrop ahora tendrá el nuevo estilo CSS (translúcido y con desenfoque).
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {/* El título ahora es más dinámico. */}
            Registrar Movimiento: {materiaPrima.nombre}
          </h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Cerrar modal">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="modal-error-message">{error}</p>}

          {/* ANOTACIÓN: INICIO DEL CAMBIO PRINCIPAL */}
          {/* Se reemplaza el <select> por un <div> estático que no es editable. */}
          <div className="modal-form-group">
            <label>Tipo de Movimiento:</label>
            <div className="modal-static-field">
              {tipoMovimientoDefault}
            </div>
          </div>
          {/* ANOTACIÓN: FIN DEL CAMBIO PRINCIPAL */}

          <div className="modal-form-group">
            {/* ANOTACIÓN: Usamos 'materiaPrima.unidad_medida' de tu componente padre, si no existe usa 'unidad'. */}
            <label htmlFor="cantidadMovimiento">Cantidad* ({materiaPrima.unidad_medida || materiaPrima.unidad}):</label>
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
              disabled={isSubmitting} // Deshabilitado durante el envío
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="descripcionMovimiento">Descripción (Opcional):</label>
            <input
              type="text"
              id="descripcionMovimiento"
              name="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Compra a Proveedor X, Uso en Lote Y"
              disabled={isSubmitting} // Deshabilitado durante el envío
            />
          </div>

          <div className="modal-form-buttons">
            <button type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarMovimientoModal;
