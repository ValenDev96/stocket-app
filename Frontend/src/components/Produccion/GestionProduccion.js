import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { registrarProduccion, obtenerHistorialProduccion } from '../../services/produccionService';
import { obtenerTodos as obtenerProductosTerminados } from '../../services/productosTerminadosService';

const GestionProduccion = () => {
  const [historial, setHistorial] = useState([]);
  const [productos, setProductos] = useState([]);
  
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducida, setCantidadProducida] = useState('');

  const [cargando, setCargando] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const [dataHistorial, dataProductos] = await Promise.all([
        obtenerHistorialProduccion(),
        obtenerProductosTerminados()
      ]);
      setHistorial(dataHistorial);
      setProductos(dataProductos);
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const produccionData = {
        producto_terminado_id: parseInt(productoSeleccionado),
        cantidad_producida: parseInt(cantidadProducida)
      };
      const response = await registrarProduccion(produccionData);
      toast.success(response.message);
      // Limpiar formulario y recargar datos
      setProductoSeleccionado('');
      setCantidadProducida('');
      cargarDatos();
    } catch (error) {
      toast.error(error.message || 'Error al registrar la producción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cargando) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Producción</h2>
      </div>

      {/* Formulario para registrar producción */}
      <div className="card p-4 mb-4">
        <h4>Registrar Nueva Producción</h4>
        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              {/* --- CORRECCIÓN AQUÍ --- */}
              <label htmlFor="productoSelect" className="form-label">Producto a Fabricar</label>
              <select id="productoSelect" className="form-select" value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)} required>
                <option value="">Seleccione un producto...</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              {/* --- CORRECCIÓN AQUÍ --- */}
              <label htmlFor="cantidadInput" className="form-label">Cantidad Producida</label>
              <input type="number" id="cantidadInput" className="form-control" value={cantidadProducida} onChange={(e) => setCantidadProducida(e.target.value)} required min="1" />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabla de historial */}
      <h4>Historial de Producción</h4>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID Lote Prod.</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad Producida</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map(lote => (
              <tr key={lote.id}>
                <td>{lote.id}</td>
                <td>{new Date(lote.fecha_produccion).toLocaleDateString()}</td>
                <td>{lote.producto_nombre}</td>
                <td>{lote.cantidad_producida}</td>
                <td><span className="badge bg-success">{lote.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionProduccion;