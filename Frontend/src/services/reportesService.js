import api from './api'; // Asumo que tienes un archivo central de configuración de axios llamado 'api.js'


export const generarReporteVentas = async (fechaDesde, fechaHasta) => {
  try {
    // Hacemos la petición GET al backend, pasando las fechas como query params
    const response = await api.get('/reportes/ventas', {
      params: {
        fechaDesde,
        fechaHasta
      }
    });
    return response.data; // Devolvemos los datos que nos envía el backend
  } catch (error) {
    // Si hay un error en la respuesta del servidor, lo lanzamos para que el componente lo atrape
    throw error.response?.data || { message: 'Error de conexión con el servidor.' };
  }
};

export const generarReporteProductos = async (fechaDesde, fechaHasta) => {
    try {
      const response = await api.get('/reportes/productos-mas-vendidos', {
        params: {
          fechaDesde,
          fechaHasta
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión con el servidor.' };
    }
  };