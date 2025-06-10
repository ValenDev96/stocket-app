const API_URL = 'http://localhost:3000/api/providers'; // Asegúrate que coincida con tu backend

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

// Obtener historial de compras por proveedor
export async function obtenerHistorialCompras(proveedorId) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/${proveedorId}/compras`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Error al obtener historial de compras');
  }

  return data;
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