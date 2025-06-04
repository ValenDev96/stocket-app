// Frontend/src/components/Inventory/GestionMateriasPrimas.js
import React, { useState, useEffect, useCallback } from 'react';
import MateriaPrimaForm from './MateriaPrimaForm';
import MateriasPrimasList from './MateriasPrimasList';
import * as inventarioService from '../../services/inventarioService'; // Correcta importación del servicio
import '../../styles/Inventory.css';

const GestionMateriasPrimas = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [materiaPrimaAEditar, setMateriaPrimaAEditar] = useState(null); // null cuando no se edita nada
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false); // Para controlar la visibilidad del formulario

  const cargarMateriasPrimas = useCallback(async () => {
    setIsLoading(true);
    setError(''); // Limpiar errores previos
    try {
      const data = await inventarioService.getAllMateriasPrimas();
      setMateriasPrimas(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las materias primas.');
      console.error("Error al cargar:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMateriasPrimas();
  }, [cargarMateriasPrimas]);

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      if (materiaPrimaAEditar && materiaPrimaAEditar.id) {
        await inventarioService.updateMateriaPrima(materiaPrimaAEditar.id, data);
      } else {
        await inventarioService.createMateriaPrima(data);
      }
      await cargarMateriasPrimas(); // Usar await para asegurar que la lista se recarga antes de continuar
      setShowForm(false);
      setMateriaPrimaAEditar(null);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar la materia prima.');
      console.error("Error al guardar:", err);
      // No ocultar el formulario en caso de error para que el usuario pueda corregir
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (materiaPrima) => {
    setMateriaPrimaAEditar(materiaPrima);
    setError(''); // Limpiar errores al abrir el formulario para editar
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta materia prima?')) {
      setIsLoading(true);
      setError('');
      try {
        await inventarioService.deleteMateriaPrima(id);
        await cargarMateriasPrimas(); // Usar await
      } catch (err) {
        setError(err.message || 'Error al eliminar la materia prima.');
        console.error("Error al eliminar:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleShowAddForm = () => {
    setMateriaPrimaAEditar(null); // Asegura que el formulario esté en modo "crear"
    setError(''); // Limpiar errores previos
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setMateriaPrimaAEditar(null);
    setError(''); // Limpiar errores al cancelar
  };

  return (
    <div className="gestion-materias-primas-container" style={{ padding: '20px' }}>
      <h2>Gestión de Inventario - Materias Primas</h2>
      {isLoading && <p>Procesando...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!showForm && (
        <button onClick={handleShowAddForm} style={{ marginBottom: '20px' }}>
          Agregar Nueva Materia Prima
        </button>
      )}
      
      {showForm && (
        <MateriaPrimaForm
          onSubmit={handleFormSubmit}
          initialData={materiaPrimaAEditar} // Pasa null o el objeto
          onCancel={handleCancelForm}
          isEditMode={!!materiaPrimaAEditar} // true si materiaPrimaAEditar no es null
        />
      )}

      <MateriasPrimasList
        materiasPrimas={materiasPrimas}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default GestionMateriasPrimas;