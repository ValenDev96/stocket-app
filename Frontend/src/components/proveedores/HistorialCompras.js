import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerHistorialCompras } from "../../services/historialComprasServices";

export default function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const data = await obtenerHistorialCompras();
        console.log("Historial recibido:", data);
        setCompras(data);
      } catch (error) {
        console.error("Error al cargar historial:", error);
        if (error.config) {
          console.error("URL solicitada:", error.config.baseURL + error.config.url);
        }
        alert("No se pudo cargar el historial.");
      }
    };
    cargarHistorial();
  }, []);

  return (
    <div className="card shadow p-3 mt-3">
      <h3 className="mb-3">Historial de Compras</h3>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Proveedor</th>
            <th>Materia Prima</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Fecha de Compra</th>
            <th>Lote ID</th>
            <th>Registrado por</th>
          </tr>
        </thead>
        <tbody>
          {compras.length > 0 ? (
            compras.map((c) => (
              <tr key={c.id}>
                <td>{c.proveedor_nombre}</td>
                <td>{c.materia_prima_nombre}</td>
                <td>{c.cantidad}</td>
                <td>
                  {c.precio_unitario != null
                    ? `$${parseFloat(c.precio_unitario).toFixed(2)}`
                    : "-"}
                </td>
                <td>
                  {c.fecha_compra
                    ? new Date(c.fecha_compra).toLocaleDateString()
                    : "-"}
                </td>
                <td>{c.lote_id || "-"}</td>
                <td>{c.nombre_usuario ? `${c.nombre_usuario} ${c.apellido}` : "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No hay compras registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* BOTONES ABAJO */}
      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/Dashboard")}>
          ← Regresar al inicio
        </button>

        <button className="btn btn-primary btn-sm" onClick={() => navigate("/providers/compra")}>
          ← Regresar al registro de compra
        </button>
      </div>
    </div>
  );
}
