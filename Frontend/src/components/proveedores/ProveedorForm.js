import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- FALTA ESTA LÍNEA
import { crearProveedor } from '../../services/proveedoresService';
import CompraForm from './CompraForm';

function ProveedorForm() {
  const [form, setForm] = useState({
    nombre: '',
    informacion_contacto: '',
    direccion: '',
  });

  const navigate = useNavigate(); // <-- HOOK DE NAVEGACIÓN

  const irAHistorial = () => {
    navigate('/historial-compras'); // <-- Ruta configurada en App.js
  };

  const handleRegresar = () => {
    navigate('/dashboard');
    };
  const [mostrarCompraForm, setMostrarCompraForm] = useState(false);

  const handleSiguiente = (e) => {
    e.preventDefault();
    const confirmacion = window.confirm(
      '¿Ya registraste el proveedor? Si ya lo tienes registrado, puedes continuar con la compra.'
    );
    if (confirmacion) {
      setMostrarCompraForm(true);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearProveedor(form);
      alert('Proveedor registrado con éxito');
      setForm({ nombre: '', informacion_contacto: '', direccion: '' });
    } catch (error) {
      console.error('Error al registrar proveedor desde frontend:', error);
      alert(`Error al registrar proveedor: ${error.message}`);
    }
  };

  return (
    <div className="container mt-4">
      {!mostrarCompraForm ? (
        <div className="card shadow p-4">
          <h3 className="mb-4">Registrar Proveedor</h3>
          <form onSubmit={handleSubmit}>
            <label>Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="form-control mb-2"
              placeholder="Nombre"
              required
            />
            <label>Información de contacto</label>
            <input
              name="informacion_contacto"
              value={form.informacion_contacto}
              onChange={handleChange}
              className="form-control mb-2"
              placeholder="Información de contacto"
              required
            />
            <label>Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="form-control mb-3"
              placeholder="Dirección"
              required
            />
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary" type="submit">
                Guardar
              </button>
              <button className="btn btn-success" onClick={handleSiguiente}>
                Siguiente
              </button>
            </div>
          </form>
          <div className="text-end mt-3">
            <button className="btn btn-secondary" onClick={irAHistorial}>
              Ver historial de compras
            </button>
            
            
          </div>
          <button onClick={handleRegresar} className="reg">
            ← Regresar
          </button>
        </div>
        
      ) : (
        <CompraForm onRegresar={() => setMostrarCompraForm(false)} />
      )}
    </div>
  );
}

export default ProveedorForm;
