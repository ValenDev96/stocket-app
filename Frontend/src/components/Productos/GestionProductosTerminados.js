// Contenido 100% completo y corregido para: Frontend/src/components/Productos/GestionProductosTerminados.js

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// --- CORRECCIÓN ---
// Se importa desde el nuevo servicio dedicado en lugar de usar 'api' directamente.
import * as productoService from '../../services/productosTerminadosService';

// Componente de Formulario Interno
const ProductoTerminadoForm = ({ producto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    stock: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_venta: producto.precio_venta || '',
        stock: producto.stock || 0
      });
    } else {
      setFormData({ nombre: '', descripcion: '', precio_venta: '', stock: 0 });
    }
  }, [producto]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // El error ya se maneja en el componente padre con un toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h3>{producto ? 'Editar Producto Terminado' : 'Agregar Nuevo Producto'}</h3>
      <hr />
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="form-control" />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Precio de Venta</label>
            <input type="number" name="precio_venta" value={formData.precio_venta} onChange={handleChange} className="form-control" required min="0" step="0.01" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Stock Actual</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="form-control" required min="0" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary ms-2">Cancelar</button>
      </form>
    </div>
  );
};


// Componente Principal de Gestión
const GestionProductosTerminados = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modo, setModo] = useState('lista');
  const [cargando, setCargando] = useState(true);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      // --- CORRECCIÓN ---
      const data = await productoService.obtenerTodos();
      setProductos(data);
    } catch (err) {
      toast.error(err.message || 'No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);
  
  const handleGuardar = async (formData) => {
    try {
      if (modo === 'editar') {
        // --- CORRECCIÓN ---
        await productoService.actualizar(productoSeleccionado.id, formData);
        toast.success('¡Producto actualizado!');
      } else {
        // --- CORRECCIÓN ---
        await productoService.crear(formData);
        toast.success('¡Producto creado!');
      }
      setModo('lista');
      cargarProductos();
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar el producto.');
      throw err;
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
      try {
        // --- CORRECCIÓN ---
        await productoService.eliminar(id);
        toast.success('Producto eliminado.');
        cargarProductos();
      } catch (err) {
        toast.error(err.message || 'No se pudo eliminar.');
      }
    }
  };

  const handleEditar = (producto) => { setModo('editar'); setProductoSeleccionado(producto); };
  const handleCrear = () => { setModo('crear'); setProductoSeleccionado(null); };
  const handleCancelar = () => { setModo('lista'); setProductoSeleccionado(null); };

  if (cargando) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="page-container">
      {modo === 'lista' ? (
        <>
          <div className="page-header">
            <h2>Gestión de Productos Terminados</h2>
            <button onClick={handleCrear} className="btn btn-primary"><i className="fas fa-plus me-2"></i>Agregar Nuevo</button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio Venta</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id}>
                    <td>{prod.id}</td>
                    <td>{prod.nombre}</td>
                    <td>${parseFloat(prod.precio_venta).toFixed(2)}</td>
                    <td>{prod.stock}</td>
                    <td className="acciones-cell">
                      <button onClick={() => handleEditar(prod)} className="btn btn-sm btn-accion btn-warning" title="Editar Producto"><i className="fas fa-edit"></i></button>
                      <Link to={`/recetas/${prod.id}`} className="btn btn-sm btn-accion btn-info" title="Editar Receta">
                        <i className="fas fa-book-open"></i>
                      </Link>
                      <button onClick={() => handleEliminar(prod.id)} className="btn btn-sm btn-accion btn-danger" title="Eliminar Producto"><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <ProductoTerminadoForm producto={productoSeleccionado} onSubmit={handleGuardar} onCancel={handleCancelar} />
      )}
    </div>
  );
};

export default GestionProductosTerminados;