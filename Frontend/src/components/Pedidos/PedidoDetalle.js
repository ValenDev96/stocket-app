import { useEffect, useState } from 'react';
import { obtenerPedidoPorId } from '../../services/pedidosService';
import { useParams } from 'react-router-dom';

export default function PedidoDetalle() {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            const data = await obtenerPedidoPorId(id);
            setPedido(data);
        };
        cargar();
    }, [id]);

    if (!pedido) return <p>Cargando...</p>;

    return (
        <div>
            <h2>Pedido #{pedido.id}</h2>
            <p><strong>Cliente:</strong> {pedido.cliente_id}</p>
            <p><strong>Estado:</strong> {pedido.estado}</p>
            <p><strong>Fecha:</strong> {new Date(pedido.fecha_pedido).toLocaleString()}</p>
            <p><strong>Devolución:</strong> {pedido.devolucion ? 'Sí' : 'No'}</p>
            <p><strong>Motivo de devolución:</strong> {pedido.motivo_devolucion || '-'}</p>
        </div>
    );
}
