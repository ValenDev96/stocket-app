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

exports.obtenerPorId = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obtener los datos principales del pedido y el cliente
    const [pedidoRows] = await pool.query(
      `SELECT p.*, c.nombre as cliente_nombre 
       FROM pedidos p 
       JOIN clientes c ON p.cliente_id = c.id 
       WHERE p.id = ?`,
      [id]
    );

    if (pedidoRows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }
    const pedido = pedidoRows[0];

    // 2. Obtener los items (productos) de ese pedido
    const [itemsRows] = await pool.query(
      `SELECT ip.*, pt.nombre as producto_nombre 
       FROM items_pedido ip 
       JOIN productos_terminados pt ON ip.producto_terminado_id = pt.id 
       WHERE ip.pedido_id = ?`,
      [id]
    );
    pedido.items = itemsRows;

    res.status(200).json(pedido);

  } catch (error) {
    console.error("Error al obtener el detalle del pedido:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.obtenerPendientes = async (req, res) => {
  try {
    // 1. Hacemos una consulta más simple que une las tablas.
    // Esto puede devolver filas de pedidos duplicadas si un pedido tiene varios productos.
    const query = `
      SELECT 
        p.id, 
        p.fecha_entrega_estimada, 
        c.nombre as cliente_nombre,
        ip.producto_terminado_id as producto_id,
        pt.nombre as producto_nombre,
        ip.cantidad
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      JOIN items_pedido ip ON p.id = ip.pedido_id
      JOIN productos_terminados pt ON ip.producto_terminado_id = pt.id
      WHERE p.estado_pedido = 'pendiente'
      ORDER BY p.fecha_entrega_estimada ASC;
    `;
    const [rows] = await pool.query(query);

    // 2. Agrupamos los resultados en JavaScript.
    const pedidosAgrupados = {};

    for (const row of rows) {
      // Si el pedido no está en nuestro objeto, lo creamos.
      if (!pedidosAgrupados[row.id]) {
        pedidosAgrupados[row.id] = {
          id: row.id,
          fecha_entrega_estimada: row.fecha_entrega_estimada,
          cliente_nombre: row.cliente_nombre,
          items: [] // Creamos un array vacío para sus productos.
        };
      }
      // Añadimos el producto (item) al pedido correspondiente.
      pedidosAgrupados[row.id].items.push({
        producto_id: row.producto_id,
        producto_nombre: row.producto_nombre,
        cantidad: row.cantidad
      });
    }

    // 3. Convertimos el objeto de pedidos de nuevo a un array para enviarlo como JSON.
    const resultadoFinal = Object.values(pedidosAgrupados);

    res.status(200).json(resultadoFinal);

  } catch (error) {
    console.error("Error al obtener pedidos pendientes:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un nuevo pedido
exports.crear = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const usuario_id = req.usuario.id; 
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
    const detallesAuditoria = `Usuario (ID: ${usuario_id}) creó el pedido #${nuevoPedidoId} para el cliente ID ${cliente_id}.`;
        await connection.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, 'CREAR', 'pedidos', nuevoPedidoId, detallesAuditoria]
        );

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
    const usuario_id = req.usuario.id;

    if (!estado_pedido) {
        return res.status(400).json({ message: 'El nuevo estado del pedido es obligatorio.' });
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('UPDATE pedidos SET estado_pedido = ? WHERE id = ?', [estado_pedido, id]);

        // --- AUDITORÍA: Se registra el cambio de estado ---
        const detallesAuditoria = `Usuario (ID: ${usuario_id}) cambió el estado del pedido #${id} a '${estado_pedido}'.`;
        await connection.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, 'ACTUALIZAR', 'pedidos', id, detallesAuditoria]
        );
        
        await connection.commit();
        res.status(200).json({ message: 'Estado del pedido actualizado exitosamente.' });
    } catch (error) {
        await connection.rollback();
        console.error("Error al actualizar estado del pedido:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if(connection) connection.release();
    }
};

exports.marcarComoDevuelto = async (req, res) => {
    const { id } = req.params;
    const { motivo_devolucion } = req.body;
    const usuario_id = req.usuario.id;

    if (!motivo_devolucion) {
        return res.status(400).json({ message: 'El motivo de la devolución es obligatorio.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const [result] = await connection.query(
            'UPDATE pedidos SET devuelto = 1, motivo_devolucion = ?, estado_pedido = ? WHERE id = ?',
            [motivo_devolucion, 'cancelado', id]
        );
        if (result.affectedRows === 0) throw new Error('Pedido no encontrado.');

        const detallesAuditoria = `Pedido #${id} marcado como devuelto. Motivo: ${motivo_devolucion}.`;
        await connection.query(
            'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
            [usuario_id, 'ACTUALIZAR', 'pedidos', id, detallesAuditoria]
        );

        await connection.commit();
        res.status(200).json({ message: 'El pedido ha sido marcado como devuelto.' });
    } catch (error) {
        await connection.rollback();
        console.error("Error al marcar pedido como devuelto:", error);
        const statusCode = error.message.includes('encontrado') ? 404 : 500;
        res.status(statusCode).json({ message: error.message || 'Error interno del servidor.' });
    } finally {
        if(connection) connection.release();
    }
};