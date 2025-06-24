// Contenido para: src/services/authService.js

import api from './api'; // Importamos la instancia base de Axios

/**
 * Llama al endpoint de login en el backend.
 * @param {object} credentials - Contiene el email y la contraseña.
 * @returns {Promise<object>} La respuesta de la API (token y datos de usuario).
 */
export const loginUser = async (credentials) => {
  try {
    // Usamos la instancia 'api' para hacer la petición POST a '/auth/login'
    // La URL completa será: http://localhost:3000/api/auth/login
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    // Si hay un error en la respuesta de la API (ej. 401 Unauthorized),
    // axios lo arroja y lo capturamos aquí para propagarlo.
    throw error.response.data || new Error('Error de red al intentar iniciar sesión');
  }
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};