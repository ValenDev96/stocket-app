// src/services/pedidosService.js

const API_URL = 'http://localhost:3000/api/orders'; // Asegúrate de que coincida con tu backend

export async function obtenerPedidos() {
  const token = localStorage.getItem('token');

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

 const data = await response.json(); 
 
  if (!response.ok) {
    throw new Error('Error al obtener pedidos');
  }

  return data;
}

export async function actualizarPedido(id, datos) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el pedido');
  }

  return await response.json();
}
export async function crearPedido(nuevoPedido) {
  const token = localStorage.getItem('token');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nuevoPedido),
  });

  if (!response.ok) {
    throw new Error('Error al crear pedido');
  }

  return await response.json();
}
