import api from './api';

/**
 * Obtiene las estadísticas clave desde el backend para el Dashboard.
 * @returns {Promise<object>} Un objeto con las estadísticas.
 */
export const getDashboardStats = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.get('/dashboard/stats', {
            headers: {
                // Incluimos el token para pasar el middleware 'protegerRuta'
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener estadísticas del dashboard:", error);
        throw error.response?.data || new Error("No se pudieron cargar las estadísticas.");
    }
};