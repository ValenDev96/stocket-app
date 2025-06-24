
const pool = require('../config/db'); 

// Asegúrate de que la exportación se llama exactamente "generarReporteVentas"
exports.generarReporteVentas = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({ message: 'Se requieren ambas fechas, desde y hasta.' });
    }

    const statsQuery = `
      SELECT
        COUNT(id) AS numeroPedidos,
        SUM(total_pedido) AS totalVentas
      FROM pedidos
      WHERE estado_pedido != 'cancelado'
        AND DATE(fecha_pedido) BETWEEN ? AND ?;
    `;
    const [statsResult] = await pool.query(statsQuery, [fechaDesde, fechaHasta]);

    const detallesQuery = `
      SELECT
        p.id,
        p.fecha_pedido,
        c.nombre AS nombre_cliente,
        p.total_pedido,
        p.estado_pedido
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      WHERE p.estado_pedido != 'cancelado'
        AND DATE(p.fecha_pedido) BETWEEN ? AND ?
      ORDER BY p.fecha_pedido DESC;
    `;
    const [detallesResult] = await pool.query(detallesQuery, [fechaDesde, fechaHasta]);

    const reporte = {
      stats: statsResult[0] || { numeroPedidos: 0, totalVentas: 0 }, // Añadimos un fallback
      detalles: detallesResult
    };

    res.status(200).json(reporte);

  } catch (error) {
    console.error("Error al generar el reporte de ventas:", error);
    res.status(500).json({ message: 'Error interno del servidor al generar el reporte.', error: error.message });
  }
};

exports.generarReporteProductos = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({ message: 'Se requieren ambas fechas, desde y hasta.' });
    }

    const query = `
      SELECT
          pt.id AS producto_id,
          pt.nombre AS nombre_producto,
          SUM(ip.cantidad) AS total_vendido
      FROM items_pedido ip
      JOIN productos_terminados pt ON ip.producto_terminado_id = pt.id
      JOIN pedidos p ON ip.pedido_id = p.id
      WHERE
          p.estado_pedido != 'cancelado'
          AND DATE(p.fecha_pedido) BETWEEN ? AND ?
      GROUP BY
          pt.id, pt.nombre
      ORDER BY
          total_vendido DESC;
    `;

    const [productosMasVendidos] = await pool.query(query, [fechaDesde, fechaHasta]);

    res.status(200).json(productosMasVendidos);

  } catch (error) {
    console.error("Error al generar el reporte de productos:", error);
    res.status(500).json({ message: 'Error interno del servidor al generar el reporte.', error: error.message });
  }
};