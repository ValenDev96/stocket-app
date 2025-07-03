import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { registrarPago, obtenerPedidosPendientes } from '../../services/pagosService';

// --- 1. IMPORTAMOS LA FUNCIÓN DE FORMATO ---
import { formatCurrency } from '../../utils/formatters';


const RegistrarPagoModal = ({ onClose, onSave }) => {
    const [pagoData, setPagoData] = useState({
        pedido_id: '',
        monto: '',
        metodo_pago: 'Efectivo',
    });
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [loadingPedidos, setLoadingPedidos] = useState(true);
    const [errorPedidos, setErrorPedidos] = useState(null);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const data = await obtenerPedidosPendientes();
                setPedidosPendientes(data);
                if (data.length === 1) {
                    setPagoData(prev => ({ ...prev, pedido_id: data[0].id }));
                }
            } catch (err) {
                setErrorPedidos('Error al cargar pedidos. Asegúrate de que el backend de pedidos esté funcionando y las APIs sean correctas.');
                console.error('Error fetching pedidos:', err);
            } finally {
                setLoadingPedidos(false);
            }
        };
        fetchPedidos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPagoData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const montoNumerico = parseFloat(pagoData.monto);
            if (isNaN(montoNumerico) || montoNumerico <= 0) {
                Swal.fire('Advertencia', 'El monto debe ser un número positivo.', 'warning');
                return;
            }

            const pedidoSeleccionado = pedidosPendientes.find(p => p.id === parseInt(pagoData.pedido_id));
            if (pedidoSeleccionado && montoNumerico > pedidoSeleccionado.saldo_pendiente) {
                 // --- 2. APLICAMOS EL FORMATO EN EL MENSAJE DE ALERTA ---
                 Swal.fire('Advertencia', `El monto del pago (${formatCurrency(montoNumerico)}) excede el saldo pendiente (${formatCurrency(pedidoSeleccionado.saldo_pendiente)}) de este pedido.`, 'warning');
                 return;
            }

            await registrarPago({ ...pagoData, monto: montoNumerico });
            Swal.fire('¡Éxito!', 'Pago registrado exitosamente.', 'success');
            onSave();
            onClose();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'auto', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Registrar Nuevo Pago</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="pedido_id" className="form-label">Pedido Asociado</label>
                                {loadingPedidos ? (
                                    <p>Cargando pedidos...</p>
                                ) : errorPedidos ? (
                                    <p className="text-danger">{errorPedidos}</p>
                                ) : (
                                    <select
                                        className="form-select"
                                        id="pedido_id"
                                        name="pedido_id"
                                        value={pagoData.pedido_id}
                                        onChange={handleChange}
                                        required
                                        disabled={pedidosPendientes.length === 0}
                                    >
                                        <option value="">Selecciona un pedido</option>
                                        {pedidosPendientes.map(pedido => (
                                            <option key={pedido.id} value={pedido.id}>
                                                {/* --- 3. APLICAMOS EL FORMATO EN LAS OPCIONES DEL SELECT --- */}
                                                Pedido #{pedido.id} - Total: {formatCurrency(pedido.total_pedido)} - Saldo Pendiente: {formatCurrency(pedido.saldo_pendiente)}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {pedidosPendientes.length === 0 && !loadingPedidos && !errorPedidos && (
                                    <p className="text-info mt-2">No hay pedidos con saldo pendiente para registrar pagos.</p>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="monto" className="form-label">Monto del Pago</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id="monto"
                                    name="monto"
                                    value={pagoData.monto}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0.01"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="metodo_pago" className="form-label">Método de Pago</label>
                                <select
                                    className="form-select"
                                    id="metodo_pago"
                                    name="metodo_pago"
                                    value={pagoData.metodo_pago}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Crédito">Crédito</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={pedidosPendientes.length === 0}>Registrar Pago</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrarPagoModal;