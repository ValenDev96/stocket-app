import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { guardarReceta, obtenerReceta } from '../../services/recetasService';
import { obtenerTodasMateriasPrimas } from '../../services/inventarioService';
import { obtenerPorId as obtenerProductoPorId } from '../../services/productosTerminadosService';

// --- 1. IMPORTAMOS LA FUNCIÓN DE FORMATO ---
import { formatCurrency } from '../../utils/formatters';

const GestionRecetas = () => {
    const { productoId } = useParams();
    const navigate = useNavigate();

    const [producto, setProducto] = useState(null);
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [descripcion, setDescripcion] = useState('');

    // --- 2. AÑADIMOS UN NUEVO ESTADO PARA GUARDAR EL COSTO ---
    const [costoEstimado, setCostoEstimado] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cargando, setCargando] = useState(true);

    const unidadesDeMedida = ['g', 'kg', 'ml', 'L', 'unidades'];

    const cargarDatos = useCallback(async () => {
        try {
            setCargando(true);
            const [dataProducto, dataReceta, dataMateriasPrimas] = await Promise.all([
                obtenerProductoPorId(productoId),
                obtenerReceta(productoId),
                obtenerTodasMateriasPrimas()
            ]);
            
            setProducto(dataProducto);
            setMateriasPrimas(dataMateriasPrimas);
            setDescripcion(dataReceta.descripcion || '');

            // --- 3. GUARDAMOS EL COSTO ESTIMADO QUE VIENE DE LA BASE DE DATOS ---
            setCostoEstimado(dataReceta.costo_estimado || 0);

            if (dataReceta.ingredientes && dataReceta.ingredientes.length > 0) {
                setIngredientes(dataReceta.ingredientes);
            } else {
                setIngredientes([{ materia_prima_id: '', cantidad: '', unidad_medida: 'g' }]);
            }
        } catch (error) {
            toast.error(error.message || 'Error al cargar los datos.');
        } finally {
            setCargando(false);
        }
    }, [productoId]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleIngredienteChange = (index, event) => {
        const nuevosIngredientes = [...ingredientes];
        nuevosIngredientes[index][event.target.name] = event.target.value;
        setIngredientes(nuevosIngredientes);
    };

    const agregarIngrediente = () => {
        setIngredientes([...ingredientes, { materia_prima_id: '', cantidad: '', unidad_medida: 'g' }]);
    };

    const quitarIngrediente = (index) => {
        const nuevosIngredientes = ingredientes.filter((_, i) => i !== index);
        setIngredientes(nuevosIngredientes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const recetaData = {
                producto_terminado_id: productoId,
                nombre_receta: `Receta de ${producto.nombre}`,
                descripcion: descripcion,
                ingredientes: ingredientes.filter(ing => ing.materia_prima_id && ing.cantidad && ing.unidad_medida)
            };
            await guardarReceta(recetaData);
            toast.success('¡Receta guardada con éxito!');
            navigate('/finished-products');
        } catch (error) {
            toast.error(error.message || 'No se pudo guardar la receta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cargando || !producto) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Receta para: {producto.nombre}</h2>
                <button onClick={() => navigate('/finished-products')} className="btn btn-secondary"><i className="fas fa-arrow-left me-2"></i>Volver</button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Descripción / Instrucciones</label>
                    <textarea className="form-control" rows="3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}></textarea>
                </div>
                <hr />
                <h4>Ingredientes</h4>
                {ingredientes.map((ing, index) => (
                    <div key={index} className="row g-3 align-items-center mb-2">
                        <div className="col-md-5">
                            <label className="form-label visually-hidden">Ingrediente</label>
                            <select name="materia_prima_id" value={ing.materia_prima_id} onChange={(e) => handleIngredienteChange(index, e)} className="form-select" required>
                                <option value="">Seleccione una materia prima</option>
                                {materiasPrimas.map(mp => <option key={mp.id} value={mp.id}>{mp.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label visually-hidden">Cantidad</label>
                            <input type="number" name="cantidad" placeholder="Cantidad" value={ing.cantidad} onChange={(e) => handleIngredienteChange(index, e)} className="form-control" min="0" step="0.01" required/>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label visually-hidden">Unidad</label>
                             <select name="unidad_medida" value={ing.unidad_medida} onChange={(e) => handleIngredienteChange(index, e)} className="form-select" required>
                                {unidadesDeMedida.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="col-md-1">
                            <button type="button" onClick={() => quitarIngrediente(index)} className="btn btn-outline-danger w-100"><i className="fas fa-trash"></i></button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={agregarIngrediente} className="btn btn-outline-primary mt-2"><i className="fas fa-plus me-2"></i>Añadir Ingrediente</button>
                
                {/* --- 4. SECCIÓN CORREGIDA PARA MOSTRAR COSTO Y BOTÓN DE GUARDAR --- */}
                <div className="d-flex justify-content-end align-items-center mt-4">
                    <h4 className="me-4">Costo Estimado: {formatCurrency(costoEstimado)}</h4>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Receta'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GestionRecetas;