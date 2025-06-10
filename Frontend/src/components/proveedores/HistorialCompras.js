import { useEffect, useState } from 'react';
import { obtenerHistorialCompras } from '../../services/proveedoresService';

function HistorialCompras({ proveedorId }) {
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!proveedorId) return;

    async function cargarHistorial() {
      try {
        const data = await obtenerHistorialCompras(proveedorId);
        setHistorial(data);
      } catch (err) {
        setError('Error al cargar historial de compras');
        console.error(err);
      }
    }

    cargarHistorial();
  }, [proveedorId]);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Historial de Compras del Proveedor {proveedorId}</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((compra) => (
            <tr key={compra.id}>
              <td>{compra.proveedorNombre}</td>
              <td>{compra.productoNombre}</td>
              <td>{compra.cantidad}</td>
              <td>{compra.precio}</td>
              <td>{new Date(compra.fecha).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistorialCompras;