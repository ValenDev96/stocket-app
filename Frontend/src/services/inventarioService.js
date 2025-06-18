import api from './api';

/**
 * Obtiene la lista de todas las alertas activas (stock bajo y expiración).
 * @returns {Promise<Array>} Un array con los objetos de alerta.
 */
export const getAlertasActivas = async () => {
    try {
        const token = localStorage.getItem('token');
        // --- CORRECCIÓN ---
        // La ruta correcta es '/alertas', no '/alertas/activas'.
        const response = await api.get('/alertas', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener alertas activas:", error);
        throw error.response?.data || new Error("No se pudieron cargar las alertas.");
    }
};

// --- El resto de tus funciones de servicio ---

export const obtenerTodasMateriasPrimas = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get('/materias-primas', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudieron cargar las materias primas.");
    }
};

export const crearMateriaPrima = async (data) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post('/materias-primas', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo crear la materia prima.");
    }
};

export const actualizarMateriaPrima = async (id, data) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.put(`/materias-primas/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo actualizar la materia prima.");
    }
};

export const eliminarMateriaPrima = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.delete(`/materias-primas/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo eliminar la materia prima.");
    }
};

export const obtenerMovimientosPorMateriaPrima = async (materiaPrimaId) => {
    try {
        const token = localStorage.getItem('token');
        // Asumimos que la ruta es /movimientos/:materiaPrimaId. Ajusta si es diferente.
        const response = await api.get(`/movimientos/${materiaPrimaId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo cargar el historial.");
    }
};

// --- FUNCIÓN AÑADIDA PARA CORREGIR EL ERROR DE COMPILACIÓN ANTERIOR ---
/**
 * Registra un nuevo movimiento de inventario (ajuste manual).
 * @param {object} movimientoData - Los datos del movimiento a registrar.
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const registrarMovimientoInventario = async (movimientoData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post('/movimientos', movimientoData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error al registrar movimiento de inventario:", error);
        throw error.response?.data || new Error("No se pudo registrar el movimiento.");
    }
};