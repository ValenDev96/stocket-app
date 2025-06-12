// Contenido 100% completo y final para: Frontend/src/components/Inventory/GestionMateriasPrimas.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  obtenerTodasMateriasPrimas,
  crearMateriaPrima,
  actualizarMateriaPrima,
  eliminarMateriaPrima
} from '../../services/inventarioService';
import api from '../../services/api';
import HistorialModal from './HistorialModal';
import AjusteInventarioModal from './AjusteInventarioModal'; // Importamos el modal de ajuste

// Componente de Formulario Interno para Crear/Editar (sin cambios)
const MateriaPrimaForm = ({ materia, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    unidad_medida: 'kg',
    umbral_alerta: ''
  });

  useEffect(() => {
    if (materia) {
      setFormData({
        nombre: materia.nombre || '',
        descripcion: materia.descripcion || '',
        unidad_medida: materia.unidad_medida || 'kg',
        umbral_alerta: materia.umbral_alerta || ''
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        unidad_medida: 'kg',
        umbral_alerta: ''
      });
    }
  }, [materia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card p-4 mb-4">
      <h3>{materia ? 'Editar Materia Prima' : 'Agregar Nueva Materia Prima'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <input type="text" className="form-control" id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="unidad_medida" className="form-label">Unidad de Medida</label>
            <select className="form-select" id="unidad_medida" name="unidad_medida" value={formData.unidad_medida} onChange={handleChange} required >
              <option value="kg">Kilogramos (kg)</option>
              <option value="g">Gramos (g)</option>
              <option value="L">Litros (L)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="unidades">Unidades</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="umbral_alerta" className="form-label">Umbral de Alerta</label>
            <input type="number" className="form-control" id="umbral_alerta" name="umbral_alerta" value={formData.umbral_alerta} onChange={handleChange} required min="0" />
          </div>
        </div>
        <button type="submit" className="btn btn-success me-2">Guardar</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>
      </form>
    </div>
  );
};


// Componente Principal de Gestión
const GestionMateriasPrimas = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [materiaPrimaSeleccionada, setMateriaPrimaSeleccionada] = useState(null);
  const [modo, setModo] = useState('lista');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  // Estados para el modal de historial
  const [historialVisible, setHistorialVisible] = useState(false);
  const [historialData, setHistorialData] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  // --- NUEVOS ESTADOS PARA EL MODAL DE AJUSTE ---
  const [ajusteModalVisible, setAjusteModalVisible] = useState(false);

  const cargarMateriasPrimas = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerTodasMateriasPrimas();
      setMateriasPrimas(data);
      setError('');
    } catch (err) {
      setError('No se pudieron cargar las materias primas.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMateriasPrimas();
  }, [cargarMateriasPrimas]);

  const handleGuardar = async (formData) => {
    try {
      if (modo === 'editar') {
        await actualizarMateriaPrima(materiaPrimaSeleccionada.id, formData);
      } else {
        await crearMateriaPrima(formData);
      }
      handleCancelar();
      cargarMateriasPrimas();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la materia prima.');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta materia prima?')) {
      try {
        await eliminarMateriaPrima(id);
        cargarMateriasPrimas();
      } catch (err) {
        setError(err.message || 'No se pudo eliminar la materia prima.');
      }
    }
  };

  const handleEditar = (materia) => {
    setMateriaPrimaSeleccionada(materia);
    setModo('editar');
  };

  const handleCrear = () => {
    setMateriaPrimaSeleccionada(null);
    setModo('crear');
  };

  const handleCancelar = () => {
    setModo('lista');
    setMateriaPrimaSeleccionada(null);
  };

  const handleVerHistorial = async (materia) => {
    setMateriaPrimaSeleccionada(materia);
    setHistorialVisible(true);
    setCargandoHistorial(true);
    try {
      const { data } = await api.get(`/movimientos/${materia.id}`); // <-- ESTA LÍNEA ES EL PROBLEMA
      setHistorialData(data);
    } catch (err) {
      setError('No se pudo cargar el historial de movimientos.');
      console.error(err);
    } finally {
      setCargandoHistorial(false);
    }
};
  
  const handleCerrarHistorial = () => {
    setHistorialVisible(false);
    setHistorialData([]);
    setMateriaPrimaSeleccionada(null);
  };
  
  // --- NUEVAS FUNCIONES PARA MANEJAR EL MODAL DE AJUSTE ---
  const handleAbrirAjuste = (materia) => {
    setMateriaPrimaSeleccionada(materia);
    setAjusteModalVisible(true);
  };

  const handleCerrarAjuste = () => {
    setAjusteModalVisible(false);
    setMateriaPrimaSeleccionada(null);
  };

  const handleAjusteExitoso = () => {
    handleCerrarAjuste();
    cargarMateriasPrimas(); // Recargamos los datos para ver el stock actualizado
  };


  if (cargando) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
  }
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gestión de Materias Primas</h2>

      {error && <div className="alert alert-danger" role="alert" onClick={() => setError('')}>{error}</div>}

      {modo === 'lista' ? (
        <>
          <button onClick={handleCrear} className="btn btn-primary mb-3">
            <i className="fas fa-plus me-2"></i>Agregar Nueva Materia Prima
          </button>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Stock Actual</th>
                  <th>Unidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiasPrimas.map((materia) => (
                  <tr key={materia.id}>
                    <td>{materia.id}</td>
                    <td>{materia.nombre}</td>
                    <td>{materia.stock_actual}</td>
                    <td>{materia.unidad_medida}</td>
                    <td>
                      <button onClick={() => handleAbrirAjuste(materia)} className="btn btn-sm btn-success me-2" title="Ajustar Stock">
                        <i className="fas fa-wrench"></i>
                      </button>
                      <button onClick={() => handleVerHistorial(materia)} className="btn btn-sm btn-info me-2" title="Ver Historial">
                        <i className="fas fa-history"></i>
                      </button>
                      <button onClick={() => handleEditar(materia)} className="btn btn-sm btn-warning me-2" title="Editar">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleEliminar(materia.id)} className="btn btn-sm btn-danger" title="Eliminar">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <MateriaPrimaForm 
          materia={materiaPrimaSeleccionada}
          onSubmit={handleGuardar}
          onCancel={handleCancelar}
        />
      )}
      
      <HistorialModal 
        isOpen={historialVisible}
        onClose={handleCerrarHistorial}
        historial={historialData}
        materiaPrimaNombre={materiaPrimaSeleccionada?.nombre}
        cargando={cargandoHistorial}
      />

      <AjusteInventarioModal
        isOpen={ajusteModalVisible}
        onClose={handleCerrarAjuste}
        materiaPrima={materiaPrimaSeleccionada}
        onAjusteExitoso={handleAjusteExitoso}
      />
    </div>
  );
};

export default GestionMateriasPrimas;