// src/services/historialComprasServices.js

const API_URL = "http://localhost:3000/api"; // o donde esté tu backend

export const obtenerHistorialCompras = async () => {
  // Asegúrate de que coincida con la ruta en tu backend:
  // si definiste GET /api/providers/historial:
  const response = await fetch(`${API_URL}/providers/historial`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // agrega Authorization si hace falta:
      // "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Error al obtener historial de compras");
  }
  return await response.json();
};
