const pool = require("../config/db");

// --- Obtener todos los proveedores ---
exports.obtenerProveedores = async (req, res) => {
  try {
    const [proveedores] = await pool.query(`
      SELECT * FROM proveedores ORDER BY nombre ASC
    `);
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// --- Obtener proveedor por ID ---
exports.obtenerProveedorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`SELECT * FROM proveedores WHERE id = ?`, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error al obtener proveedor por ID:', error);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

// --- Crear nuevo proveedor ---
exports.registrarProveedor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { nombre, informacion_contacto, direccion } = req.body;
    const usuario_id = req.usuario.id;

    if (!nombre || !informacion_contacto) {
      return res.status(400).json({ message: "Nombre e información de contacto son obligatorios." });
    }

    const query = `INSERT INTO proveedores (nombre, informacion_contacto, direccion, is_active) VALUES (?, ?, ?, true)`;
    const [result] = await connection.query(query, [nombre, informacion_contacto, direccion || null]);
    const nuevoProveedorId = result.insertId;

    // --- AUDITORÍA ---
    const detallesAuditoria = `Usuario (ID: ${usuario_id}) creó el proveedor '${nombre}' (ID: ${nuevoProveedorId}).`;
    await connection.query(
      'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, 'CREAR', 'proveedores', nuevoProveedorId, detallesAuditoria]
    );

    await connection.commit();
    res.status(201).json({ message: 'Proveedor registrado exitosamente', id: nuevoProveedorId });

  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un proveedor con ese nombre o contacto.' });
    }
    console.error('Error al registrar proveedor:', error);
    res.status(500).json({ error: "Error interno al registrar proveedor" });
  } finally {
    if (connection) connection.release();
  }
};


// --- Actualizar proveedor ---
exports.actualizarProveedor = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { nombre, informacion_contacto, direccion, is_active } = req.body;
    const usuario_id = req.usuario.id;

    const [result] = await connection.query(
      `UPDATE proveedores SET nombre = ?, informacion_contacto = ?, direccion = ?, is_active = ? WHERE id = ?`,
      [nombre, informacion_contacto, direccion || null, is_active !== undefined ? is_active : true, id]
    );
    if (result.affectedRows === 0) throw new Error('Proveedor no encontrado.');

    // --- AUDITORÍA ---
    const detallesAuditoria = `Usuario (ID: ${usuario_id}) actualizó el proveedor con ID: ${id}.`;
    await connection.query(
      'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, 'ACTUALIZAR', 'proveedores', id, detallesAuditoria]
    );
    
    await connection.commit();
    res.json({ message: 'Proveedor actualizado correctamente.' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar proveedor:', error);
    const statusCode = error.message.includes('encontrado') ? 404 : 500;
    res.status(statusCode).json({ message: error.message || 'Error al actualizar proveedor.' });
  } finally {
    if(connection) connection.release();
  }
};

// --- Inactivar proveedor ---
exports.inactivarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`UPDATE proveedores SET is_active = false WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }

    res.json({ message: 'Proveedor inactivado correctamente.' });
  } catch (error) {
    console.error('Error al inactivar proveedor:', error);
    res.status(500).json({ message: 'Error al inactivar proveedor.' });
  }
};

// --- Activar proveedor ---
exports.activarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`UPDATE proveedores SET is_active = true WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }

    res.json({ message: 'Proveedor activado correctamente.' });
  } catch (error) {
    console.error('Error al activar proveedor:', error);
    res.status(500).json({ message: 'Error al activar proveedor.' });
  }
};

exports.obtenerHistorialCompras = async (req, res) => {
  try {
    const query = `
      SELECT
        c.id,
        p.nombre AS proveedor_nombre,
        c.materia_prima_nombre,
        c.cantidad,
        c.precio_unitario,
        (c.cantidad * c.precio_unitario) AS costo_total,
        c.fecha_compra,
        c.lote_id,
        c.usuario_id,
        u.nombre_usuario,
        u.apellido
      FROM compras_proveedores c
      JOIN proveedores p ON p.id = c.proveedor_id
      LEFT JOIN usuarios u ON u.id = c.usuario_id
      ORDER BY c.fecha_compra DESC
    `;

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("¡ERROR en obtenerHistorialCompras!:", error);
    res.status(500).json({
      error: "Error al obtener historial de compras",
      details: error.message
    });
  }
};

