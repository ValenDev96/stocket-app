import { useState } from "react";
// Asegúrate de que esta ruta y el nombre de la función 'registrarCompra' son correctos
import { registrarCompra } from "../../services/proveedoresService";

export default function CompraForm() {
  // 1. Actualizar el estado inicial 'compra' con los nuevos nombres de campos
  // Estos nombres de propiedad en el estado de React se alinean con las columnas de lotes_materias_primas
  const [compra, setCompra] = useState({
    id_proveedor: "",         // Corresponde a 'proveedor_id' en la DB
    materia_prima_id: "",     // Corresponde a 'materia_prima_id' en la DB (antes 'producto')
    cantidad_ingresada: "",   // Corresponde a 'cantidad_ingresada' en la DB (antes 'cantidad')
    costo_compra: "",         // Corresponde a 'costo_compra' en la DB (antes 'precio_unitario')
    fecha_ingreso: "",        // Corresponde a 'fecha_ingreso' en la DB (antes 'fecha_compra')
    fecha_expiracion: "",     // Nuevo campo opcional para 'fecha_expiracion' en la DB
  });

  // 2. 'handleChange' se mantiene igual, ya que es genérico y funciona con los nuevos 'name' de los inputs
  const handleChange = (e) => setCompra({ ...compra, [e.target.name]: e.target.value });

  // 3. 'handleSubmit' ajustado para la nueva lógica y validación
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validación en el frontend (primera capa)
      // Se validan los campos obligatorios para 'lotes_materias_primas'
      if (
        !compra.id_proveedor ||
        !compra.materia_prima_id ||
        !compra.cantidad_ingresada ||
        !compra.costo_compra ||
        !compra.fecha_ingreso
      ) {
        alert("Por favor, rellena todos los campos obligatorios para el lote de materia prima.");
        return;
      }

      // Llama a la función del servicio para enviar los datos al backend
      // El objeto 'compra' ahora tiene los nombres de propiedad correctos que el backend espera
      await registrarCompra(compra);
      alert("Lote de materia prima registrado exitosamente");

      // Resetea el formulario con los nuevos nombres de propiedades a cadenas vacías
      setCompra({
        id_proveedor: "",
        materia_prima_id: "",
        cantidad_ingresada: "",
        costo_compra: "",
        fecha_ingreso: "",
        fecha_expiracion: "",
      });

    } catch (error) {
      // Manejo de errores
      console.error('Error al registrar el lote de materia prima:', error);
      alert("Error al registrar el lote de materia prima: " + (error.message || "Error desconocido"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar Lote de Materia Prima (Compra)</h2>
      {/* 4. Actualizar los inputs del formulario con los nuevos 'name' y 'value' */}
      {/* type="number" para asegurar que se ingresen valores numéricos en campos ID y cantidades/costos */}
      <input
        name="id_proveedor"
        value={compra.id_proveedor}
        onChange={handleChange}
        placeholder="ID Proveedor"
        type="number"
        required
      />
      {/* Campo para el ID de la Materia Prima */}
      <input
        name="materia_prima_id"
        value={compra.materia_prima_id}
        onChange={handleChange}
        placeholder="ID Materia Prima"
        type="number"
        required
      />
      {/* Campo para la Cantidad Ingresada, con 'step' para permitir decimales */}
      <input
        name="cantidad_ingresada"
        value={compra.cantidad_ingresada}
        onChange={handleChange}
        placeholder="Cantidad Ingresada (ej. 10.5)"
        type="number"
        step="0.01"
        required
      />
      {/* Campo para el Costo Total de la Compra, con 'step' para permitir decimales */}
      <input
        name="costo_compra"
        value={compra.costo_compra}
        onChange={handleChange}
        placeholder="Costo Total de Compra (ej. 150.75)"
        type="number"
        step="0.01"
        required
      />
      {/* Campo para la Fecha de Ingreso del Lote */}
      <input
        name="fecha_ingreso"
        value={compra.fecha_ingreso}
        onChange={handleChange}
        placeholder="Fecha de Ingreso"
        type="date"
        required
      />
      {/* Campo opcional para la Fecha de Expiración del Lote */}
      <input
        name="fecha_expiracion"
        value={compra.fecha_expiracion}
        onChange={handleChange}
        placeholder="Fecha de Expiración (opcional)"
        type="date"
      />
      <button type="submit">Registrar Lote</button>
    </form>
  );
}