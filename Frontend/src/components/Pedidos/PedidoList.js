import { useEffect, useState } from 'react';
import { obtenerPedidos, actualizarPedido } from '../../services/pedidosService';

export default function PedidoList() {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        const datos = await obtenerPedidos();
        setPedidos(datos);
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        await actualizarPedido(id, { estado: nuevoEstado });
        cargarPedidos();
    };

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Devolución</th>
                    <th>Motivo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {pedidos.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.cliente_id}</td>
                        <td>{new Date(p.fecha_pedido).toLocaleString()}</td>
                        <td>{p.estado}</td>
                        <td>{p.devolucion ? 'Sí' : 'No'}</td>
                        <td>{p.motivo_devolucion || '-'}</td>
                        <td>
                            {p.estado !== 'entregado' && (
                                <>
                                    <button onClick={() => cambiarEstado(p.id, 'aprobado')}>Aprobar</button>
                                    <button onClick={() => cambiarEstado(p.id, 'entregado')}>Entregar</button>
                                    <button onClick={() => cambiarEstado(p.id, 'rechazado')}>Rechazar</button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
