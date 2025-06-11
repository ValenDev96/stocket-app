
const API_URL = 'http://localhost:3000/api/providers'; // Asegúrate que coincida con tu backend
const API_MATERIAS_PRIMAS_URL = 'http://localhost:3001/api/materias_primas'; // Nueva constante para materias primas

// Crear un nuevo proveedor
export async function crearProveedor(nuevoProveedor) {
  const token = localStorage.getItem('token');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nuevoProveedor),
  });

  if (!response.ok) {
    throw new Error('Error al crear proveedor');
  }

  return await response.json();
}

// Registrar una compra
export async function registrarCompra(compra) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/compras`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(compra),
  });

  if (!response.ok) {
    throw new Error('Error al registrar compra');
  }

  return await response.json();
}




// Comparar precios por producto (si lo usas en el futuro)
export async function compararPrecios(producto) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/comparar/precios?producto=${encodeURIComponent(producto)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Error al comparar precios');
  }

  return data;
}
// Obtener todos los proveedores (solo id y nombre)
export async function obtenerProveedores() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener proveedores');
  }

  return await response.json();
}
