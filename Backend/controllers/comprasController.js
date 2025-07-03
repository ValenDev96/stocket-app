const pool = require('../config/db');

exports.registrarCompra = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { materia_prima_id, proveedor_id, cantidad, precio_unitario, fecha_compra, fecha_expiracion } = req.body;
    const usuario_id = req.usuario.id; // Obtenemos el ID del usuario que realiza la acción

    if (!materia_prima_id || !proveedor_id || !cantidad || !precio_unitario || !fecha_compra) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    const [materiaRows] = await connection.query('SELECT nombre FROM materias_primas WHERE id = ?', [materia_prima_id]);
    if (materiaRows.length === 0) {
      throw new Error('La materia prima con el ID proporcionado no existe.');
    }
    const materia_prima_nombre = materiaRows[0].nombre;

    const [proveedorRows] = await connection.query('SELECT id FROM proveedores WHERE id = ?', [proveedor_id]);
    if (proveedorRows.length === 0) {
      throw new Error('El proveedor con el ID proporcionado no existe.');
    }

    const costo_compra = parseFloat(cantidad) * parseFloat(precio_unitario);

    const loteInsertQuery = `
      INSERT INTO lotes_materias_primas 
      (materia_prima_nombre, proveedor_id, cantidad_ingresada, stock_lote, costo_compra, fecha_expiracion) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    const loteValues = [materia_prima_nombre, proveedor_id, cantidad, cantidad, costo_compra, fecha_expiracion || null];
    
    const [loteResult] = await connection.query(loteInsertQuery, loteValues);
    const nuevoLoteId = loteResult.insertId;

    // --- PASO 1: Capturamos el ID de la nueva compra para usarlo en la auditoría ---
    const [compraResult] = await connection.query(
      'INSERT INTO compras_proveedores (proveedor_id, materia_prima_nombre, cantidad, precio_unitario, fecha_compra, lote_id, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [proveedor_id, materia_prima_nombre, cantidad, precio_unitario, fecha_compra, nuevoLoteId, usuario_id]
    );
    const nuevaCompraId = compraResult.insertId;

    await connection.query(
      'INSERT INTO movimientos_inventario_mp (lote_id, tipo_movimiento, cantidad, descripcion, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [nuevoLoteId, 'entrada', cantidad, `Entrada por compra al proveedor ID: ${proveedor_id}`, usuario_id]
    );

    // --- PASO 2: Insertamos el registro en la tabla de auditoría ---
    const detallesAuditoria = `Se registró la compra #${nuevaCompraId} de ${cantidad} de ${materia_prima_nombre}.`;
    await connection.query(
        'INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
        [usuario_id, 'CREAR', 'compras_proveedores', nuevaCompraId, detallesAuditoria]
    );

    await connection.commit();
    res.status(201).json({ message: 'Compra y lote registrados exitosamente.' });

  } catch (error) {
    await connection.rollback();
    console.error('Error detallado al registrar la compra:', error);
    const statusCode = error.message.includes('no existe') ? 404 : 500;
    res.status(statusCode).json({ message: error.message || 'Error interno del servidor al registrar la compra.' });
  } finally {
    if (connection) connection.release();
  }
};