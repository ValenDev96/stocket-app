import api from './api'; // Usamos la instancia de Axios que ya tienes

/**
 * Obtiene la lista completa de roles desde el backend.
 * @returns {Promise<Array>} Un array de objetos, donde cada objeto es un rol.
 */
export const fetchRoles = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/roles', {
      headers: {
        Authorization: `Bearer ${token}` // Asumiendo que la ruta está protegida
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener roles:", error);
    throw error.response?.data || new Error("No se pudieron cargar los roles.");
  }
};

/**
 * Registra un nuevo usuario en el sistema.
 * @param {object} userData - Los datos del nuevo usuario.
 * @returns {Promise<object>} La respuesta del servidor.
 */
export const registerUser = async (userData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post('/auth/register', userData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        throw error.response?.data || new Error("No se pudo registrar el usuario.");
    }
};