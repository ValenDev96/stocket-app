import React, { useState, useEffect, useCallback } from 'react';
import {
  obtenerTodasMateriasPrimas,
  crearMateriaPrima,
  actualizarMateriaPrima,
  eliminarMateriaPrima,
  obtenerMovimientosPorMateriaPrima
} from '../../services/inventarioService';
import HistorialModal from './HistorialModal';
import AjusteInventarioModal from './AjusteInventarioModal';
import GestionLotesModal from './GestionLoteModal';
import { toast } from 'react-toastify';
import { formatQuantity } from '../../utils/formatters'; 

// Componente de Formulario Interno (sin cambios)
const MateriaPrimaForm = ({ materia, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    unidad_medida: 'kg',
    umbral_alerta: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (materia) {
      setFormData({
        nombre: materia.nombre || '',
        descripcion: materia.descripcion || '',
        unidad_medida: materia.unidad_medida || 'kg',
        umbral_alerta: materia.umbral_alerta || ''
      });
    } else {
      setFormData({ nombre: '', descripcion: '', unidad_medida: 'kg', umbral_alerta: '' });
    }
  }, [materia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // El error se maneja en el componente padre
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h3>{materia ? 'Editar Materia Prima' : 'Agregar Nueva Materia Prima'}</h3>
      <hr />
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
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="ms-2">Guardando...</span>
            </>
          ) : 'Guardar Cambios'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary ms-2">Cancelar</button>
      </form>
    </div>
  );
};


// --- Componente Principal de Gestión ---
const GestionMateriasPrimas = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [materiaPrimaSeleccionada, setMateriaPrimaSeleccionada] = useState(null);
  const [modo, setModo] = useState('lista');
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const [historialVisible, setHistorialVisible] = useState(false);
  const [historialData, setHistorialData] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [ajusteModalVisible, setAjusteModalVisible] = useState(false);
  const [lotesModalVisible, setLotesModalVisible] = useState(false);

  const cargarMateriasPrimas = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerTodasMateriasPrimas();
      setMateriasPrimas(data);
    } catch (err) {
      toast.error(err.message || 'No se pudieron cargar las materias primas.');
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
        toast.success('¡Materia prima actualizada!');
      } else {
        await crearMateriaPrima(formData);
        toast.success('¡Materia prima creada!');
      }
      handleCancelar();
      cargarMateriasPrimas();
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar la materia prima.');
      throw err;
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro? La materia prima se eliminará permanentemente si no tiene registros asociados.')) {
      try {
        await eliminarMateriaPrima(id);
        toast.success('Materia prima eliminada.');
        cargarMateriasPrimas();
      } catch (err) {
        toast.error(err.message || 'No se pudo eliminar.');
      }
    }
  };

  const handleVerHistorial = async (materia) => {
    setMateriaPrimaSeleccionada(materia);
    setHistorialVisible(true);
    setCargandoHistorial(true);
    try {
      const data = await obtenerMovimientosPorMateriaPrima(materia.id);
      setHistorialData(data);
    } catch (err) {
      toast.error(err.message || 'No se pudo cargar el historial.');
    } finally {
      setCargandoHistorial(false);
    }
  };

  const handleAjusteExitoso = () => {
    handleCerrarAjuste();
    cargarMateriasPrimas();
    toast.success('¡Ajuste registrado!');
  };

  const handleCerrarGestionLotes = () => {
    setLotesModalVisible(false);
    cargarMateriasPrimas();
  };

  const handleCrear = () => { setModo('crear'); setMateriaPrimaSeleccionada(null); };
  const handleEditar = (materia) => { setModo('editar'); setMateriaPrimaSeleccionada(materia); };
  const handleCancelar = () => { setModo('lista'); setMateriaPrimaSeleccionada(null); };
  const handleCerrarHistorial = () => setHistorialVisible(false);
  const handleAbrirAjuste = (materia) => { setMateriaPrimaSeleccionada(materia); setAjusteModalVisible(true); };
  const handleCerrarAjuste = () => setAjusteModalVisible(false);
  const handleGestionarLotes = (materia) => { setMateriaPrimaSeleccionada(materia); setLotesModalVisible(true); };

  const materiasFiltradas = materiasPrimas.filter(materia =>
    materia.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }
  
  return (
    <div className="page-container">
      {modo === 'lista' ? (
        <>
          <div className="page-header">
            <h2>Gestión de materias primas</h2>
            <button onClick={handleCrear} className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>Agregar Nueva
            </button>
          </div>
          <div className="mb-3">
            {/* --- CORRECCIÓN AQUÍ --- */}
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por nombre..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)}
              id="busquedaMateriaPrima"
              name="busquedaMateriaPrima"
              aria-label="Buscar materia prima por nombre"
            />
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Stock Actual</th>
                  <th>Umbral de Alerta</th>
                  <th>Unidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiasFiltradas.length > 0 ? (
                  materiasFiltradas.map((materia) => (
                    <tr key={materia.id}>
                      <td>{materia.id}</td>
                      <td>{materia.nombre}</td>
                      <td>{formatQuantity(materia.stock_actual)}</td>
                      <td>{formatQuantity(materia.umbral_alerta)}</td>
                      <td>{materia.unidad_medida}</td>
                      <td className="acciones-cell">
                        <button onClick={() => handleGestionarLotes(materia)} className="btn btn-sm btn-accion btn-primary" title="Gestionar Lotes"><i className="fas fa-boxes"></i></button>
                        <button onClick={() => handleAbrirAjuste(materia)} className="btn btn-sm btn-accion btn-success" title="Ajustar Stock"><i className="fas fa-wrench"></i></button>
                        <button onClick={() => handleVerHistorial(materia)} className="btn btn-sm btn-accion btn-info" title="Ver Historial"><i className="fas fa-history"></i></button>
                        <button onClick={() => handleEditar(materia)} className="btn btn-sm btn-accion btn-warning" title="Editar"><i className="fas fa-edit"></i></button>
                        <button onClick={() => handleEliminar(materia.id)} className="btn btn-sm btn-accion btn-danger" title="Eliminar"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center">No se encontraron materias primas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <MateriaPrimaForm materia={materiaPrimaSeleccionada} onSubmit={handleGuardar} onCancel={handleCancelar} />
      )}
      <HistorialModal isOpen={historialVisible} onClose={handleCerrarHistorial} historial={historialData} materiaPrimaNombre={materiaPrimaSeleccionada?.nombre} cargando={cargandoHistorial}/>
      <AjusteInventarioModal isOpen={ajusteModalVisible} onClose={handleCerrarAjuste} materiaPrima={materiaPrimaSeleccionada} onAjusteExitoso={handleAjusteExitoso}/>
      <GestionLotesModal isOpen={lotesModalVisible} onClose={handleCerrarGestionLotes} materiaPrima={materiaPrimaSeleccionada} onLoteDescartado={handleCerrarGestionLotes}/>
    </div>
  );
};

export default GestionMateriasPrimas;