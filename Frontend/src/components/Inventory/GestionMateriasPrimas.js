import React, { useState, useEffect, useCallback } from 'react';
import MateriaPrimaForm from './MateriaPrimaForm';
import MateriasPrimasList from './MateriasPrimasList';
import RegistrarMovimientoModal from './RegistrarMovimientoModal'; // <-- IMPORTAR EL MODAL
import * as inventarioService from '../../services/inventarioService';
import '../../styles/Inventory.css';

const GestionMateriasPrimas = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [materiaPrimaAEditar, setMateriaPrimaAEditar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // --- ESTADO PARA EL MODAL DE MOVIMIENTOS ---
  const [isModalMovimientoOpen, setIsModalMovimientoOpen] = useState(false);
  const [materiaPrimaParaMovimiento, setMateriaPrimaParaMovimiento] = useState(null);
  const [tipoMovimientoParaModal, setTipoMovimientoParaModal] = useState('entrada'); // 'entrada' o 'salida'

  // Obtener el rol del usuario para determinar permisos en el frontend
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rolUsuarioId = usuario?.rol_id;
  // Roles que pueden modificar el inventario (crear/editar/eliminar MP, registrar movimientos)
  // Basado en backend: 1 (admin), 3 (bodega)
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

  // --- FUNCIONES PARA MANEJAR EL MODAL DE MOVIMIENTOS ---
  const abrirModalMovimiento = (materiaPrima, tipo) => {
    setMateriaPrimaParaMovimiento(materiaPrima);
    setTipoMovimientoParaModal(tipo);
    setIsModalMovimientoOpen(true);
    setError(''); // Limpiar errores generales al abrir el modal
  };

  const cerrarModalMovimiento = () => {
    setIsModalMovimientoOpen(false);
    setMateriaPrimaParaMovimiento(null);
  };

  const handleRegistrarMovimientoSubmit = async (movimientoData) => {
    setIsLoading(true); // Podrías tener un isLoading específico para el modal
    setError('');
    try {
      const resultado = await inventarioService.registrarMovimientoInventario(movimientoData);
      console.log('Respuesta del registro de movimiento:', resultado);
      // Actualizar la materia prima específica en la lista o recargar toda la lista
      // Opción 1: Recargar todo (más simple)
      await cargarMateriasPrimas();
      // Opción 2: Actualizar solo la materia prima afectada (más optimizado pero más complejo)
      // setMateriasPrimas(prevMateriasPrimas => 
      //   prevMateriasPrimas.map(mp => 
      //     mp.id === resultado.materiaPrimaActualizada.id ? resultado.materiaPrimaActualizada : mp
      //   )
      // );
      // cerrarModalMovimiento(); // Ya se cierra desde el modal si es exitoso
    } catch (err) {
      console.error("Error al registrar movimiento desde GestionMateriasPrimas:", err);
      // El error ya se maneja y muestra en el modal, pero podrías querer mostrar un error global aquí también
      setError(`Error en el modal: ${err.message}`); // Esto mostraría el error fuera del modal también
      throw err; // Relanzar el error para que el modal sepa que falló y no se cierre
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gestion-materias-primas-container">
      <h2 className="gmp-title">Gestión de Inventario - Materias Primas</h2>
      
      {isLoading && <p className="loading-message-gmp">Procesando...</p>}
      {error && <p className="error-message-gmp">Error General: {error}</p>}
      
      {/* Botón para agregar nueva materia prima, visible solo si el usuario tiene permiso */}
      {puedeModificarInventario && !showForm && (
        <button onClick={handleShowAddFormMateriaPrima} className="gmp-add-button">
          Agregar Nueva Materia Prima
        </button>
      )}
      
      {/* Formulario para agregar/editar materia prima, visible solo si el usuario tiene permiso y showForm es true */}
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
        onEdit={handleEditMateriaPrima} // La visibilidad del botón Editar se controla dentro de MateriasPrimasList
        onDelete={handleDeleteMateriaPrima} // La visibilidad del botón Eliminar se controla dentro de MateriasPrimasList
        onRegistrarEntrada={(mp) => abrirModalMovimiento(mp, 'entrada')}
        onRegistrarSalida={(mp) => abrirModalMovimiento(mp, 'salida')}
        puedeModificarInventario={puedeModificarInventario} // Pasar el permiso a la lista
      />

      {/* El Modal para Registrar Movimientos */}
      {materiaPrimaParaMovimiento && ( // Renderizar el modal solo si hay una materiaPrima seleccionada
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