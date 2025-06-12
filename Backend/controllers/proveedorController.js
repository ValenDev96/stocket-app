
const pool = require("../config/db");

// --- Obtener lista de proveedores (para dropdowns, etc.) ---
exports.obtenerProveedores = async (req, res) => {
  try {
    const [proveedores] = await pool.query(`SELECT id, nombre FROM proveedores ORDER BY nombre ASC`);
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// --- Registrar nuevo proveedor ---
exports.registrarProveedor = async (req, res) => {
  try {
    const { nombre, informacion_contacto, direccion } = req.body;
    if (!nombre || !informacion_contacto) {
        return res.status(400).json({ message: "Nombre e información de contacto son obligatorios." });
    }
    const query = `INSERT INTO proveedores (nombre, informacion_contacto, direccion) VALUES (?, ?, ?)`;
    const [result] = await pool.query(query, [nombre, informacion_contacto, direccion || null]);
    res.status(201).json({ message: 'Proveedor registrado exitosamente', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ya existe un proveedor con ese nombre o contacto.' });
    }
    console.error('Error al registrar proveedor:', error);
    res.status(500).json({ error: "Error interno al registrar proveedor" });
  }
};

// --- Registrar nueva compra (lote de materia prima) ---
exports.registrarCompra = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { proveedor_id, materia_prima_id, cantidad, precio_unitario, fecha_compra, fecha_expiracion } = req.body;
    const usuario_id = req.usuario.id;

    if (!proveedor_id || !materia_prima_id || !cantidad || !precio_unitario || !fecha_compra) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const [materia] = await connection.query('SELECT nombre FROM materias_primas WHERE id = ?', [materia_prima_id]);
    if (materia.length === 0) throw new Error('Materia prima no encontrada.');
    const materia_prima_nombre = materia[0].nombre;

    const costo_compra = parseFloat(cantidad) * parseFloat(precio_unitario);

    const [loteResult] = await connection.query(
      'INSERT INTO lotes_materias_primas (materia_prima_nombre, proveedor_id, cantidad_ingresada, stock_lote, costo_compra, fecha_expiracion) VALUES (?, ?, ?, ?, ?, ?)',
      [materia_prima_nombre, proveedor_id, cantidad, cantidad, costo_compra, fecha_expiracion || null]
    );
    const lote_id = loteResult.insertId;

    await connection.query(
      'INSERT INTO compras_proveedores (proveedor_id, materia_prima_nombre, cantidad, precio_unitario, fecha_compra, lote_id, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [proveedor_id, materia_prima_nombre, cantidad, precio_unitario, fecha_compra, lote_id, usuario_id]
    );

    // --- CORRECCIÓN CRÍTICA ---
    // Se añade el movimiento de inventario para que el trigger actualice el stock general.
    await connection.query(
        'INSERT INTO movimientos_inventario_mp (lote_id, tipo_movimiento, cantidad, descripcion, usuario_id) VALUES (?, ?, ?, ?, ?)',
        [lote_id, 'entrada', cantidad, `Entrada por compra al proveedor ID: ${proveedor_id}`, usuario_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Compra y lote registrados exitosamente', id_lote: lote_id });

  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar la compra:', error);
    res.status(500).json({ error: 'Error al registrar la compra', details: error.message });
  } finally {
    connection.release();
  }
};

// --- Obtener historial de compras ---
exports.obtenerHistorialCompras = async (req, res) => {
  // --- PASOS DE DEPURACIÓN ---
  console.log("1. Petición recibida en 'obtenerHistorialCompras'.");

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

    console.log("2. Ejecutando consulta a la base de datos...");
    const [rows] = await pool.query(query);
    console.log("3. Consulta finalizada. Se encontraron " + rows.length + " registros.");
    
    res.json(rows);
    console.log("4. Respuesta JSON enviada al frontend.");

  } catch (error) {
    console.error("¡ERROR en obtenerHistorialCompras!:", error);
    res.status(500).json({
      error: "Error al obtener historial de compras",
      details: error.message
    });
  }
};

// --- Comparar precios por producto ---
exports.compararPrecios = async (req, res) => {
    // ... tu función existente aquí, está bien como estaba ...
};

