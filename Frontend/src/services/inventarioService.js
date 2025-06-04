// Frontend/src/services/inventarioService.js

const API_URL_BASE = 'http://localhost:3000/api'; // O el puerto de tu backend

// Función para obtener el token de localStorage
const getToken = () => localStorage.getItem('token');

// Obtener todas las materias primas
export const getAllMateriasPrimas = async () => {
  const response = await fetch(`${API_URL_BASE}/materiasprimas`, {
    headers: { // Añadir cabeceras
      'Authorization': `Bearer ${getToken()}`, // Enviar el token
      'Content-Type': 'application/json' // Aunque para GET no siempre es necesario, es buena práctica
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener materias primas y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al obtener materias primas');
  }
  return response.json();
};

// Crear materia prima
export const createMateriaPrima = async (materiaPrimaData) => {
  const response = await fetch(`${API_URL_BASE}/materiasprimas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}` // Enviar el token
    },
    body: JSON.stringify(materiaPrimaData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al crear materia prima y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al crear materia prima');
  }
  return response.json();
};

// Actualizar materia prima
export const updateMateriaPrima = async (id, materiaPrimaData) => {
  const response = await fetch(`<span class="math-inline">{API_URL_BASE}/materiasprimas/</span>{id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}` // Enviar el token
    },
    body: JSON.stringify(materiaPrimaData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al actualizar materia prima y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al actualizar materia prima');
  }
  return response.json();
};

// Eliminar materia prima
export const deleteMateriaPrima = async (id) => {
  const response = await fetch(`<span class="math-inline">{API_URL_BASE}/materiasprimas/</span>{id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}` // Enviar el token
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al eliminar materia prima y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al eliminar materia prima');
  }
  return response.json();
};

// (getMateriaPrimaById también necesitaría el token en headers si la usas)
export const getMateriaPrimaById = async (id) => {
  const response = await fetch(`<span class="math-inline">{API_URL_BASE}/materiasprimas/</span>{id}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener materia prima por ID y respuesta no es JSON' }));
    throw new Error(errorData.message || 'Error desconocido al obtener la materia prima por ID');
  }
  return response.json();
};