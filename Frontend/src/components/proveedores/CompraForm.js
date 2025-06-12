import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerProveedores, registrarCompra } from '../../services/proveedoresService';
import { obtenerTodasMateriasPrimas } from '../../services/inventarioService';

// El nombre del componente ahora coincide con el de tu archivo
const CompraForm = () => {
  const navigate = useNavigate();

  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [formData, setFormData] = useState({
    proveedor_id: '',
    materia_prima_id: '',
    cantidad: '',
    precio_unitario: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    fecha_expiracion: ''
  });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [dataProveedores, dataMateriasPrimas] = await Promise.all([
          obtenerProveedores(),
          obtenerTodasMateriasPrimas()
        ]);
        setProveedores(dataProveedores);
        setMateriasPrimas(dataMateriasPrimas);
      } catch (error) {
        setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los datos para el formulario.' });
      } finally {
        setCargando(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    try {
      await registrarCompra(formData);
      
      // Lógica de redirección que solicitaste
      navigate('/inventory'); 

    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message || 'Error al registrar la compra.' });
      console.error("Error al registrar la compra:", error);
    }
  };

  if (cargando) {
    return <p>Cargando datos del formulario...</p>;
  }

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <h2>Registrar Nueva Compra de Materia Prima</h2>
        <p>Al registrar una compra, se creará un nuevo lote y se actualizará el stock.</p>
        <hr />
        {mensaje.texto && (
          <div className={`alert ${mensaje.tipo === 'error' ? 'alert-danger' : ''}`}>
            {mensaje.texto}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Materia Prima</label>
              <select name="materia_prima_id" value={formData.materia_prima_id} onChange={handleChange} className="form-select" required>
                <option value="">Seleccione una materia prima</option>
                {materiasPrimas.map(mp => <option key={mp.id} value={mp.id}>{mp.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Proveedor</label>
              <select name="proveedor_id" value={formData.proveedor_id} onChange={handleChange} className="form-select" required>
                <option value="">Seleccione un proveedor</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Cantidad Recibida</label>
              <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} className="form-control" required min="0.01" step="0.01" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Precio Unitario</label>
              <input type="number" name="precio_unitario" value={formData.precio_unitario} onChange={handleChange} className="form-control" required min="0.01" step="0.01" />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Fecha de Compra</label>
              <input type="date" name="fecha_compra" value={formData.fecha_compra} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Fecha de Expiración (Opcional)</label>
              <input type="date" name="fecha_expiracion" value={formData.fecha_expiracion} onChange={handleChange} className="form-control" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Registrar Compra y Crear Lote</button>
        </form>
      </div>
    </div>
  );
};

// Se exporta con el nombre correcto
export default CompraForm;