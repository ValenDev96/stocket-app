// RUTA: .../components/Inventory/GestionMateriasPrimas.js

import React, { useState, useEffect, useCallback } from 'react';
import MateriaPrimaForm from './MateriaPrimaForm';
import MateriasPrimasList from './MateriasPrimasList';
import RegistrarMovimientoModal from './RegistrarMovimientoModal';
import * as inventarioService from '../../services/inventarioService';
import '../../styles/Inventory.css';

// ANOTACIÓN: Se importa el icono que vamos a usar en el botón "Agregar".
import { FaPlus } from 'react-icons/fa';

const GestionMateriasPrimas = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [materiaPrimaAEditar, setMateriaPrimaAEditar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [isModalMovimientoOpen, setIsModalMovimientoOpen] = useState(false);
  const [materiaPrimaParaMovimiento, setMateriaPrimaParaMovimiento] = useState(null);
  const [tipoMovimientoParaModal, setTipoMovimientoParaModal] = useState('entrada');

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rolUsuarioId = usuario?.rol_id;
  const ROLES_PARA_MODIFICAR_INVENTARIO = [1, 3];
  const puedeModificarInventario = ROLES_PARA_MODIFICAR_INVENTARIO.includes(rolUsuarioId);

  const cargarMateriasPrimas = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await inventarioService.getAllMateriasPrimas();
      setMateriasPrimas(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las materias primas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMateriasPrimas();
  }, [cargarMateriasPrimas]);

  const handleFormSubmitMateriaPrima = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      if (materiaPrimaAEditar && materiaPrimaAEditar.id) {
        await inventarioService.updateMateriaPrima(materiaPrimaAEditar.id, data);
      } else {
        await inventarioService.createMateriaPrima(data);
      }
      await cargarMateriasPrimas();
      setShowForm(false);
      setMateriaPrimaAEditar(null);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar la materia prima.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMateriaPrima = (materiaPrima) => {
    setMateriaPrimaAEditar(materiaPrima);
    setError('');
    setShowForm(true);
  };

  const handleDeleteMateriaPrima = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta materia prima?')) {
      setIsLoading(true);
      setError('');
      try {
        await inventarioService.deleteMateriaPrima(id);
        await cargarMateriasPrimas();
      } catch (err) {
        setError(err.message || 'Error al eliminar la materia prima.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleShowAddFormMateriaPrima = () => {
    setMateriaPrimaAEditar(null);
    setError('');
    setShowForm(true);
  };

  const handleCancelFormMateriaPrima = () => {
    setShowForm(false);
    setMateriaPrimaAEditar(null);
    setError('');
  };

  const abrirModalMovimiento = (materiaPrima, tipo) => {
    setMateriaPrimaParaMovimiento(materiaPrima);
    setTipoMovimientoParaModal(tipo);
    setIsModalMovimientoOpen(true);
    setError('');
  };

  const cerrarModalMovimiento = () => {
    setIsModalMovimientoOpen(false);
    setMateriaPrimaParaMovimiento(null);
  };

  const handleRegistrarMovimientoSubmit = async (movimientoData) => {
    setIsLoading(true);
    setError('');
    try {
      await inventarioService.registrarMovimientoInventario(movimientoData);
      await cargarMateriasPrimas();
    } catch (err) {
      console.error("Error al registrar movimiento desde GestionMateriasPrimas:", err);
      setError(`Error en el modal: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gestion-materias-primas-container">
      <h2 className="gmp-title">Gestión de Inventario - Materias Primas</h2>
      
      {isLoading && <p className="loading-message-gmp">Procesando...</p>}
      {error && <p className="error-message-gmp">Error General: {error}</p>}
      
      {puedeModificarInventario && !showForm && (
        // ANOTACIÓN: Se añade el componente de icono <FaPlus /> dentro del botón.
        <button onClick={handleShowAddFormMateriaPrima} className="gmp-add-button">
          <FaPlus /> Agregar Nueva Materia Prima
        </button>
      )}
      
      {showForm && puedeModificarInventario && (
        <MateriaPrimaForm
          onSubmit={handleFormSubmitMateriaPrima}
          initialData={materiaPrimaAEditar}
          onCancel={handleCancelFormMateriaPrima}
          isEditMode={!!materiaPrimaAEditar}
        />
      )}

      <MateriasPrimasList
        materiasPrimas={materiasPrimas}
        onEdit={handleEditMateriaPrima}
        onDelete={handleDeleteMateriaPrima}
        onRegistrarEntrada={(mp) => abrirModalMovimiento(mp, 'entrada')}
        onRegistrarSalida={(mp) => abrirModalMovimiento(mp, 'salida')}
        puedeModificarInventario={puedeModificarInventario}
      />

      {materiaPrimaParaMovimiento && (
        <RegistrarMovimientoModal
          isOpen={isModalMovimientoOpen}
          onClose={cerrarModalMovimiento}
          materiaPrima={materiaPrimaParaMovimiento}
          tipoMovimientoDefault={tipoMovimientoParaModal}
          onSubmit={handleRegistrarMovimientoSubmit}
        />
      )}
    </div>
  );
};

export default GestionMateriasPrimas;