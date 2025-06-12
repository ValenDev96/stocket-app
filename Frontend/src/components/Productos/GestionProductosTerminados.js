// Contenido para: Frontend/src/components/Productos/GestionProductosTerminados.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; // Usaremos una instancia de axios para simplificar

// Componente de Formulario Interno
const ProductoTerminadoForm = ({ producto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    stock: '' // El stock ahora se puede editar aquí
  });

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_venta: producto.precio_venta || '',
        stock: producto.stock || 0
      });
    }
  }, [producto]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card p-4 mb-4">
      <h3>{producto ? 'Editar Producto Terminado' : 'Agregar Nuevo Producto'}</h3>
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
        <button type="submit" className="btn btn-success me-2">Guardar</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>
      </form>
    </div>
  );
};


// Componente Principal
const GestionProductosTerminados = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modo, setModo] = useState('lista');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      const { data } = await api.get('/productos-terminados');
      setProductos(data);
      setError('');
    } catch (err) {
      setError('No se pudieron cargar los productos terminados.');
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
        await api.put(`/productos-terminados/${productoSeleccionado.id}`, formData);
      } else {
        await api.post('/productos-terminados', formData);
      }
      handleCancelar(); // Volver a la lista
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el producto.');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/productos-terminados/${id}`);
        cargarProductos();
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo eliminar el producto.');
      }
    }
  };

  const handleEditar = (producto) => {
    setProductoSeleccionado(producto);
    setModo('editar');
  };
  
  const handleCrear = () => {
    setProductoSeleccionado(null);
    setModo('crear');
  };

  const handleCancelar = () => {
    setModo('lista');
    setProductoSeleccionado(null);
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gestión de Productos Terminados</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {modo === 'lista' ? (
        <>
          <button onClick={handleCrear} className="btn btn-primary mb-3">Agregar Nuevo Producto</button>
          <table className="table table-striped">
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
                  <td>${prod.precio_venta}</td>
                  <td>{prod.stock}</td>
                  <td>
                    <button onClick={() => handleEditar(prod)} className="btn btn-sm btn-warning me-2">Editar</button>
                    <button onClick={() => handleEliminar(prod.id)} className="btn btn-sm btn-danger">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <ProductoTerminadoForm 
          producto={productoSeleccionado}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
};

export default GestionProductosTerminados;