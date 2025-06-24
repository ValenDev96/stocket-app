import api from './api'; // Asumiendo que usas una instancia de Axios centralizada llamada 'api'

/**
 * @description Obtiene todos los registros de horas trabajadas.
 */
export const obtenerHoras = async () => {
    try {
        const response = await api.get('/horas-trabajadas');
        return response.data;
    } catch (error) {
        // Lanza el error para que el componente lo pueda manejar
        throw error.response.data || new Error('Error al obtener los registros de horas.');
    }
};

/**
 * @description Registra un nuevo turno de trabajo.
 * @param {object} data - Datos del nuevo registro.
 */
export const registrarHora = async (data) => {
    try {
        const response = await api.post('/horas-trabajadas', data);
        return response.data;
    } catch (error) {
        throw error.response.data || new Error('Error al registrar la hora.');
    }
};

/**
 * @description Actualiza un registro de hora existente.
 * @param {number} id - El ID del registro a actualizar.
 * @param {object} data - Los nuevos datos para el registro.
 */
export const actualizarHora = async (id, data) => {
    try {
        const response = await api.put(`/horas-trabajadas/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response.data || new Error('Error al actualizar el registro.');
    }
};

/**
 * @description Elimina un registro de hora.
 * @param {number} id - El ID del registro a eliminar.
 */
export const eliminarHora = async (id) => {
    try {
        const response = await api.delete(`/horas-trabajadas/${id}`);
        return response.data;
    } catch (error) {
        throw error.response.data || new Error('Error al eliminar el registro.');
    }
};