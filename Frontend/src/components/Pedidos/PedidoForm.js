import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { crearPedido } from '../../services/pedidosService';
import { obtenerTodos as obtenerProductosTerminados } from '../../services/productosTerminadosService';
import { obtenerClientes } from '../../services/clientesService';

// --- 1. IMPORTAMOS LA FUNCIÓN DE FORMATO ---
import { formatCurrency } from '../../utils/formatters';

const PedidoForm = () => {
  const navigate = useNavigate();

  const [clienteId, setClienteId] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [items, setItems] = useState([{ producto_terminado_id: '', cantidad: 1, precio_unitario: 0 }]);
  
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoDatos(true);
        const [dataClientes, dataProductos] = await Promise.all([
          obtenerClientes(),
          obtenerProductosTerminados()
        ]);
        setClientes(dataClientes);
        setProductos(dataProductos);
      } catch (error) {
        toast.error(error.message || 'No se pudieron cargar los datos para el formulario.');
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarDatos();
  }, []);

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const nuevosItems = [...items];
    nuevosItems[index][name] = value;

    if (name === 'producto_terminado_id') {
      const productoSeleccionado = productos.find(p => p.id === parseInt(value));
      nuevosItems[index].precio_unitario = productoSeleccionado ? productoSeleccionado.precio_venta : 0;
    }

    setItems(nuevosItems);
  };

  const agregarItem = () => {
    setItems([...items, { producto_terminado_id: '', cantidad: 1, precio_unitario: 0 }]);
  };

  const quitarItem = (index) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  };

  const totalPedido = useMemo(() => {
    return items.reduce((total, item) => total + (item.cantidad * item.precio_unitario), 0);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const pedidoData = {
        cliente_id: parseInt(clienteId),
        fecha_entrega_estimada: fechaEntrega,
        items: items.map(item => ({
            ...item,
            cantidad: parseInt(item.cantidad),
            producto_terminado_id: parseInt(item.producto_terminado_id)
        })),
        total_pedido: totalPedido
      };

      await crearPedido(pedidoData);
      toast.success('¡Pedido creado con éxito!');
      navigate('/orders');

    } catch (error) {
      toast.error(error.message || 'Error al crear el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cargandoDatos) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Crear nuevo pedido</h2>
        <button onClick={() => navigate('/orders')} className="btn btn-secondary">
          <i className="fas fa-arrow-left me-2"></i>Volver a Pedidos
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label">Cliente</label>
            <select className="form-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
              <option value="">Seleccione un cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Fecha de entrega estimada</label>
            <input type="date" className="form-control" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} required />
          </div>
        </div>

        <hr />
        
        <h4>Productos del pedido</h4>
        {items.map((item, index) => (
          <div key={index} className="row g-3 align-items-center mb-3">
            <div className="col-md-5">
              <label className="form-label visually-hidden">Producto</label>
              <select name="producto_terminado_id" value={item.producto_terminado_id} onChange={(e) => handleItemChange(index, e)} className="form-select" required>
                <option value="">Seleccione un producto</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label visually-hidden">Cantidad</label>
              <input type="number" name="cantidad" value={item.cantidad} onChange={(e) => handleItemChange(index, e)} className="form-control" required min="1" />
            </div>
            <div className="col-md-2">
              <label className="form-label visually-hidden">Precio Unit.</label>
              {/* --- 2. APLICAMOS EL FORMATO AL PRECIO UNITARIO --- */}
              <input type="text" value={formatCurrency(item.precio_unitario)} className="form-control" disabled />
            </div>
            <div className="col-md-2">
                <label className="form-label visually-hidden">Subtotal</label>
                {/* --- 3. APLICAMOS EL FORMATO AL SUBTOTAL --- */}
                <input type="text" value={formatCurrency(item.cantidad * item.precio_unitario)} className="form-control" disabled />
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <button type="button" onClick={() => quitarItem(index)} className="btn btn-outline-danger"><i className="fas fa-trash"></i></button>
            </div>
          </div>
        ))}

        <button type="button" onClick={agregarItem} className="btn btn-outline-primary mb-4">
          <i className="fas fa-plus me-2"></i>Añadir Producto
        </button>

        <div className="d-flex justify-content-end align-items-center">
            {/* --- 4. APLICAMOS EL FORMATO AL TOTAL GENERAL --- */}
            <h3 className="me-4">Total: {formatCurrency(totalPedido)}</h3>
            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Pedido'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default PedidoForm;