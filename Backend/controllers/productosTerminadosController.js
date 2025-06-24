// Contenido para: Backend/controllers/productosTerminadosController.js

const pool = require('../config/db');

// Obtener todos los productos terminados
exports.obtenerTodos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos_terminados ORDER BY nombre ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener productos terminados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.obtenerPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM productos_terminados WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto terminado no encontrado' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un nuevo producto terminado
exports.crear = async (req, res) => {
  const { nombre, descripcion, precio_venta } = req.body;

  if (!nombre || precio_venta === undefined) {
    return res.status(400).json({ message: 'Nombre y precio de venta son obligatorios.' });
  }
  if (parseFloat(precio_venta) < 0) {
    return res.status(400).json({ message: 'El precio de venta no puede ser negativo.' });
  }

  try {
    // El stock inicial por defecto es 0
    const [result] = await pool.query(
      'INSERT INTO productos_terminados (nombre, descripcion, precio_venta, stock) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || null, precio_venta, 0]
    );
    res.status(201).json({
      message: 'Producto terminado creado exitosamente',
      id: result.insertId,
      ...req.body,
      stock: 0
    });
  } catch (error) {
    console.error('Error al crear producto terminado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar un producto terminado
exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio_venta, stock } = req.body; // El stock se puede ajustar aquí

  if (!nombre || precio_venta === undefined || stock === undefined) {
    return res.status(400).json({ message: 'Nombre, precio de venta y stock son obligatorios.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE productos_terminados SET nombre = ?, descripcion = ?, precio_venta = ?, stock = ? WHERE id = ?',
      [nombre, descripcion || null, precio_venta, stock, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto terminado no encontrado' });
    }
    res.status(200).json({ message: 'Producto terminado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto terminado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar un producto terminado
exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM productos_terminados WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto terminado no encontrado' });
    }
    res.status(200).json({ message: 'Producto terminado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto terminado:', error);
     if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'No se puede eliminar: este producto está en uso en pedidos o recetas.' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};