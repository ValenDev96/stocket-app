import api from './api'; // Asume que tienes api.js para la URL base y token

// Función auxiliar para crear las cabeceras con el token
const createAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
};

export const obtenerClientes = async () => {
    const response = await fetch(`${api.defaults.baseURL}/clientes`, {
        headers: createAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener clientes');
    return await response.json();
};