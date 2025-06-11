import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  registrarCompra,
  obtenerProveedores,
} from "../../services/proveedoresService";

export default function CompraForm({ onRegresar }) {
  const [compra, setCompra] = useState({
    proveedor_id: "",
    materia_prima_nombre: "",
    cantidad_ingresada: "",
    costo_compra: "",
    fecha_ingreso: "",
    fecha_expiracion: "",
  });

  const [proveedores, setProveedores] = useState([]);
  const navigate = useNavigate();

  const irAHistorial = () => {
    navigate('/providers/historial');
      
  };
  const irADashboard = () => {
    navigate('/providers');
  };

  const handleChange = (e) =>
    setCompra({ ...compra, [e.target.name]: e.target.value });

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const data = await obtenerProveedores();
        console.log("Proveedores obtenidos:", data);
        setProveedores(data);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
        alert("No se pudieron cargar los proveedores.");
      }
    };

    fetchProveedores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const camposObligatorios = [
        "proveedor_id",
        "materia_prima_nombre",
        "cantidad_ingresada",
        "costo_compra",
        "fecha_ingreso",
      ];

      const faltan = camposObligatorios.some((campo) => !compra[campo]);

      if (faltan) {
        alert("Por favor, rellena todos los campos obligatorios.");
        return;
      }

      // ✅ Recuperar usuario desde localStorage
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      if (!usuario || !usuario.id) {
        alert("Usuario no autenticado. Inicia sesión nuevamente.");
        return;
      }

      // ✅ Incluir usuario_id en la compra
      const compraConStock = {
        ...compra,
        stock_lote: compra.cantidad_ingresada,
        usuario_id: usuario.id,
      };

      await registrarCompra(compraConStock);
      alert("Lote de materia prima registrado exitosamente");

      setCompra({
        proveedor_id: "",
        materia_prima_nombre: "",
        cantidad_ingresada: "",
        costo_compra: "",
        fecha_ingreso: "",
        fecha_expiracion: "",
      });
    } catch (error) {
      console.error("Error al registrar el lote:", error);
      alert("Error al registrar el lote: " + (error.message || "Error desconocido"));
    }
  };

  return (
    <div className="card shadow p-4 mt-4">
      <h3 className="mb-4">Registrar Lote de Materia Prima (Compra)</h3>
      <form onSubmit={handleSubmit}>
        <label>Proveedor:</label>
        <select
          name="proveedor_id"
          value={compra.proveedor_id}
          onChange={handleChange}
          className="form-control mb-2"
          required
        >
          <option value="">Seleccione un proveedor</option>
          {proveedores.map((prov) => (
            <option key={prov.id} value={prov.id}>
              {prov.nombre}
            </option>
          ))}
        </select>

        <label>Materia Prima (Nombre del Insumo):</label>
        <input
          name="materia_prima_nombre"
          value={compra.materia_prima_nombre}
          onChange={handleChange}
          className="form-control mb-2"
          type="text"
          placeholder="Ej: Harina"
          required
        />

        <label>Cantidad Ingresada:</label>
        <input
          name="cantidad_ingresada"
          value={compra.cantidad_ingresada}
          onChange={handleChange}
          className="form-control mb-2"
          type="number"
          step="0.01"
          required
        />

        <label>Costo Total de Compra:</label>
        <input
          name="costo_compra"
          value={compra.costo_compra}
          onChange={handleChange}
          className="form-control mb-2"
          type="number"
          step="0.01"
          required
        />

        <label>Fecha de Ingreso:</label>
        <input
          name="fecha_ingreso"
          value={compra.fecha_ingreso}
          onChange={handleChange}
          className="form-control mb-2"
          type="date"
          required
        />

        <label>Fecha de Expiración (opcional):</label>
        <input
          name="fecha_expiracion"
          value={compra.fecha_expiracion}
          onChange={handleChange}
          className="form-control mb-3"
          type="date"
        />

        <div className="d-flex justify-content-between mt-3">
        <button
        type="button"
        className="btn btn-secondary"
        onClick={irADashboard} // ← cambio aquí
      >
        ← Regresar
      </button>

          <button
            type="button"
            className="btn btn-info"
            onClick={irAHistorial}
          >
            Ver historial de compras
          </button>

          <button className="btn btn-primary" type="submit">
            Registrar Lote
          </button>
        </div>
      </form>
    </div>
  );
}
