const db = require('../config/db'); // Asegúrate de que este archivo exista y exporte tu conexión a la base de datos

exports.crearPedido = async (req, res) => {
  try {
    const { cliente_id, fecha_pedido, estado, devuelto, motivo_devolucion } = req.body;

    if (!estado) {
      return res.status(400).json({ mensaje: 'El campo "estado" es obligatorio.' });
    }

    const [result] = await db.execute(
      `INSERT INTO pedidos (cliente_id, fecha_pedido, estado, devuelto, motivo_devolucion) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        cliente_id || null,
        fecha_pedido || null, // Si no se envía, MySQL usará CURRENT_TIMESTAMP
        estado,
        devuelto ?? false,
        motivo_devolucion || null,
      ]
    );

    res.status(201).json({ mensaje: 'Pedido registrado', id: result.insertId });
  } catch (error) {
    console.error('Error al crear pedido:', error.message);
    res.status(500).json({ mensaje: 'Error al crear el pedido', error: error.message });
  }
};

exports.listarPedidos = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM pedidos");
    res.json(rows);
  } catch (error) {
    console.error('Error al listar pedidos:', error.message);
    res.status(500).json({ mensaje: 'Error al listar los pedidos', error: error.message });
  }
};

exports.obtenerPedido = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM pedidos WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener pedido:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener el pedido', error: error.message });
  }
};

exports.actualizarPedido = async (req, res) => {
  try {
    const { estado, devuelto, motivo_devolucion } = req.body;

    await db.execute(
      `UPDATE pedidos SET estado = ?, devuelto = ?, motivo_devolucion = ? WHERE id = ?`,
      [estado, devuelto ?? false, motivo_devolucion || null, req.params.id]
    );

    res.json({ mensaje: 'Pedido actualizado' });
  } catch (error) {
    console.error('Error al actualizar pedido:', error.message);
    res.status(500).json({ mensaje: 'Error al actualizar el pedido', error: error.message });
  }
};

exports.eliminarPedido = async (req, res) => {
  try {
    await db.execute("DELETE FROM pedidos WHERE id = ?", [req.params.id]);
    res.json({ mensaje: 'Pedido eliminado' });
  } catch (error) {
    console.error('Error al eliminar pedido:', error.message);
    res.status(500).json({ mensaje: 'Error al eliminar el pedido', error: error.message });
  }
};
