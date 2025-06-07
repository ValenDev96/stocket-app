import { useState } from 'react';
import { crearPedido } from '../../services/pedidosService';

export default function PedidoForm() {
    const [form, setForm] = useState({
        cliente_id: '',
        estado: 'pendiente',
        devolucion: false,
        motivo_devolucion: ''
    });

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await crearPedido(form);
        alert(res.mensaje);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="cliente_id" onChange={handleChange} placeholder="ID Cliente" />
            <select name="estado" onChange={handleChange}>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
            </select>
            <label>
                <input type="checkbox" name="devolucion" onChange={handleChange} />
                ¿Devolución?
            </label>
            <textarea name="motivo_devolucion" onChange={handleChange} placeholder="Motivo si aplica" />
            <button type="submit">Guardar</button>
        </form>
    );
}
