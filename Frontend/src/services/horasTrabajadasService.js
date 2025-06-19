import api from './api'; // Asegúrate de que este sea tu archivo de configuración de axios

export const horasTrabajadasService = {
    // Obtener todas las horas trabajadas (para admin)
    obtenerTodas: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            if (filtros.empleado_id) params.append('empleado_id', filtros.empleado_id);
            if (filtros.rol) params.append('rol', filtros.rol);
            if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
            if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
            
            const queryString = params.toString();
            const url = queryString ? `/horas-trabajadas?${queryString}` : '/horas-trabajadas';
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error al obtener todas las horas trabajadas:', error);
            throw error;
        }
    },

    // Obtener horas trabajadas por usuario específico
    obtenerPorUsuario: async (usuarioId) => {
        try {
            const response = await api.get(`/horas-trabajadas/usuario/${usuarioId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener horas trabajadas por usuario:', error);
            throw error;
        }
    },

    // Crear nueva hora trabajada
    crear: async (datos) => {
        try {
            console.log('Enviando datos al backend:', datos);
            const response = await api.post('/horas-trabajadas', datos);
            return response.data;
        } catch (error) {
            console.error('Error al crear hora trabajada:', error);
            throw error;
        }
    },

    // Actualizar hora trabajada
    actualizar: async (id, datos) => {
        try {
            const response = await api.put(`/horas-trabajadas/${id}`, datos);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar hora trabajada:', error);
            throw error;
        }
    },

    // Eliminar hora trabajada
    eliminar: async (id) => {
        try {
            const response = await api.delete(`/horas-trabajadas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar hora trabajada:', error);
            throw error;
        }
    }
};