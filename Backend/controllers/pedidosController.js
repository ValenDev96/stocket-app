const pool = require('../config/db');

// Obtener todos los pedidos
exports.obtenerTodos = async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.fecha_pedido, p.fecha_entrega_estimada, p.estado_pedido, p.total_pedido, c.nombre as cliente_nombre
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.fecha_pedido DESC;
    `;
    const [pedidos] = await pool.query(query);
    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un nuevo pedido
exports.crear = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { cliente_id, fecha_entrega_estimada, total_pedido, items } = req.body;

    if (!cliente_id || !fecha_entrega_estimada || !items || items.length === 0) {
      return res.status(400).json({ message: 'Faltan datos obligatorios para el pedido.' });
    }

    await connection.beginTransaction();

    // 1. Verificar el stock de todos los productos ANTES de hacer cualquier cambio
    for (const item of items) {
      const [productoRows] = await connection.query('SELECT stock FROM productos_terminados WHERE id = ? FOR UPDATE', [item.producto_terminado_id]);
      if (productoRows.length === 0 || productoRows[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para el producto ID ${item.producto_terminado_id}.`);
      }
    }

    // 2. Insertar el pedido en la tabla 'pedidos'
    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (cliente_id, fecha_entrega_estimada, estado_pedido, total_pedido) VALUES (?, ?, ?, ?)',
      [cliente_id, fecha_entrega_estimada, 'pendiente', total_pedido]
    );
    const nuevoPedidoId = pedidoResult.insertId;

    // 3. Insertar cada item del pedido y actualizar el stock
    for (const item of items) {
      // Insertar en 'items_pedido'
      await connection.query(
        'INSERT INTO items_pedido (pedido_id, producto_terminado_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [nuevoPedidoId, item.producto_terminado_id, item.cantidad, item.precio_unitario]
      );
      // Actualizar el stock en 'productos_terminados'
      await connection.query(
        'UPDATE productos_terminados SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_terminado_id]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Pedido creado exitosamente.', pedidoId: nuevoPedidoId });

  } catch (error) {
    await connection.rollback();
    console.error("Error al crear el pedido:", error);
    // Devuelve un error 400 si el problema fue el stock, si no un 500
    const statusCode = error.message.includes('Stock insuficiente') ? 400 : 500;
    res.status(statusCode).json({ message: error.message || 'Error interno del servidor.' });
  } finally {
    connection.release();
  }
};
exports.actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado_pedido } = req.body;

  if (!estado_pedido) {
    return res.status(400).json({ message: 'El nuevo estado del pedido es obligatorio.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE pedidos SET estado_pedido = ? WHERE id = ?',
      [estado_pedido, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }
    res.status(200).json({ message: 'Estado del pedido actualizado exitosamente.' });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
exports.marcarComoDevuelto = async (req, res) => {
  const { id } = req.params;
  const { motivo_devolucion } = req.body;

  if (!motivo_devolucion) {
    return res.status(400).json({ message: 'El motivo de la devolución es obligatorio.' });
  }

  try {
    // Actualizamos los campos 'devuelto' y 'motivo_devolucion' y ponemos el estado como 'cancelado'
    const [result] = await pool.query(
      'UPDATE pedidos SET devuelto = 1, motivo_devolucion = ?, estado_pedido = ? WHERE id = ?',
      [motivo_devolucion, 'cancelado', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }
    res.status(200).json({ message: 'El pedido ha sido marcado como devuelto.' });
  } catch (error) {
    console.error("Error al marcar pedido como devuelto:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};