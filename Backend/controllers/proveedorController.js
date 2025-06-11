// controllers/proveedorController.js

const pool = require("../config/db");

// --- Registrar nuevo proveedor ---
exports.registrarProveedor = async (req, res) => {
  try {
    const { nombre, informacion_contacto, direccion } = req.body;

    const query = `
      INSERT INTO proveedores (nombre, informacion_contacto, direccion)
      VALUES (?, ?, ?)
    `;
    const values = [nombre, informacion_contacto, direccion];
    const [result] = await pool.query(query, values);

    res.status(201).json({
      message: 'Proveedor registrado exitosamente',
      id_proveedor: result.insertId
    });
  } catch (error) {
    console.error('Error al registrar proveedor:', error);
    res.status(500).json({ error: "Error al registrar proveedor", details: error.message });
  }
};

// --- Registrar nueva compra (lote de materia prima) ---
exports.registrarCompra = async (req, res) => {
  try {
     console.log("Datos recibidos en el backend:", req.body);
    const {
      proveedor_id,
      materia_prima_nombre,
      cantidad_ingresada,
      costo_compra,
      fecha_ingreso,
      fecha_expiracion,
      usuario_id, // ← asegúrate de que esto venga del frontend
      observaciones // opcional
    } = req.body;

    if (
      !proveedor_id ||
      !materia_prima_nombre ||
      !cantidad_ingresada ||
      !costo_compra ||
      !fecha_ingreso
    ) {
      return res.status(400).json({ error: "Faltan datos obligatorios para registrar el lote de materia prima." });
    }

    const parsedCantidad = parseFloat(cantidad_ingresada);
    const parsedCosto = parseFloat(costo_compra);

    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
      return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
    }
    if (isNaN(parsedCosto) || parsedCosto < 0) {
      return res.status(400).json({ error: "El costo debe ser un número no negativo." });
    }

    // 1. Insertar en lotes_materias_primas
    const insertLoteQuery = `
      INSERT INTO lotes_materias_primas (
        proveedor_id,
        materia_prima_nombre,
        cantidad_ingresada,
        stock_lote,
        costo_compra,
        fecha_ingreso,
        fecha_expiracion
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const loteValues = [
      proveedor_id,
      materia_prima_nombre,
      parsedCantidad,
      parsedCantidad,
      parsedCosto,
      fecha_ingreso,
      fecha_expiracion || null
    ];

    const [loteResult] = await pool.query(insertLoteQuery, loteValues);
    const lote_id = loteResult.insertId;

    // 2. Obtener id de materia_prima desde su nombre
    const [[materia]] = await pool.query(
      `SELECT id FROM materias_primas WHERE nombre = ?`,
      [materia_prima_nombre]
    );
    const materiaPrimaId = materia?.id;

    // 3. Insertar en compras_proveedores
    const insertCompraQuery = `
      INSERT INTO compras_proveedores (
        proveedor_id,
        materia_prima_nombre,
        cantidad,
        precio_unitario,
        fecha_compra,
        lote_id,
        usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const compraValues = [
      proveedor_id,
      materia_prima_nombre,
      parsedCantidad,
      parsedCosto,
      fecha_ingreso,
      lote_id,
      usuario_id || null
    ];

    await pool.query(insertCompraQuery, compraValues);

    res.status(201).json({
      message: 'Compra registrada exitosamente',
      id_lote_generado: lote_id
    });

  } catch (error) {
    console.error('Error al registrar la compra:', error);
    res.status(500).json({ error: 'Error al registrar la compra', details: error.message });
  }
};


// --- Obtener historial de compras desde lotes_materias_primas ---
exports.obtenerHistorialCompras = async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial de compras:", error);
    res.status(500).json({
      error: "Error al obtener historial de compras",
      details: error.message
    });
  }
};

// --- Comparar precios por producto ---
exports.compararPrecios = async (req, res) => {
  try {
    const { producto } = req.query;

    const query = `
      SELECT
          l.*,
          p.nombre AS proveedor_nombre,
          p.informacion_contacto AS proveedor_contacto,
          p.direccion AS proveedor_direccion
      FROM
          lotes_materias_primas l
      JOIN
          proveedores p ON l.proveedor_id = p.id
      WHERE
          l.materia_prima_nombre = ?
      ORDER BY
          l.costo_compra ASC;
    `;

    const [comprasConProveedor] = await pool.query(query, [producto]);
    res.json(comprasConProveedor);

  } catch (error) {
    console.error('Error al comparar precios:', error);
    res.status(500).json({ error: "Error al comparar precios", details: error.message });
  }
};

// --- Obtener lista de proveedores (ID y nombre) ---
exports.obtenerProveedores = async (req, res) => {
  try {
    const [proveedores] = await pool.query(`SELECT id, nombre FROM proveedores`);
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

