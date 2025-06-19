import axios from 'axios';
const API_URL = 'http://localhost:3000/api/clientes'; // ajusta según tu ruta real

export const obtenerClientes = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};


export const crearCliente = async (cliente) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(API_URL, cliente, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const actualizarCliente = async (id, cliente) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(`${API_URL}/${id}`, cliente, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const eliminarCliente = async (id) => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
