// Contenido para: Backend/controllers/usuariosController.js

const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios con sus roles
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.empleado_id, u.nombre_usuario, u.apellido, u.email, u.activo, r.nombre_rol 
      FROM usuarios u 
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id ASC
    `;
    const [usuarios] = await pool.query(query);
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
  }
};

// Actualizar un usuario existente
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre_usuario, apellido, email, rol_id, activo } = req.body;

  if (!nombre_usuario || !email || !rol_id) {
    return res.status(400).json({ message: 'Nombre, email y rol son requeridos.' });
  }

  try {
    // Nota: Esta implementación no actualiza la contraseña para mantenerlo simple.
    // La actualización de contraseña debería ser un proceso separado y más seguro.
    const query = `
      UPDATE usuarios u JOIN empleados e ON u.empleado_id = e.id
      SET u.nombre_usuario = ?, u.apellido = ?, u.email = ?, u.rol_id = ?, u.activo = ?,
          e.nombre_usuario = ?, e.apellido = ?, e.correo = ?, e.rol_id = ?
      WHERE u.id = ?
    `;
    await pool.query(query, [
      nombre_usuario, apellido, email, rol_id, activo,
      nombre_usuario, apellido, email, rol_id,
      id
    ]);
    res.status(200).json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario.', error: error.message });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Primero, obtenemos el empleado_id asociado al usuario
    const [userRows] = await connection.query('SELECT empleado_id FROM usuarios WHERE id = ?', [id]);
    if (userRows.length === 0) {
      throw new Error('Usuario no encontrado.');
    }
    const { empleado_id } = userRows[0];

    // Borramos al usuario (la FK en 'empleados' se encarga del resto si está configurada en cascada,
    // pero es más seguro borrar ambos explícitamente).
    await connection.query('DELETE FROM usuarios WHERE id = ?', [id]);
    await connection.query('DELETE FROM empleados WHERE id = ?', [empleado_id]);
    
    await connection.commit();
    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error al eliminar el usuario.', error: error.message });
  } finally {
    connection.release();
  }
};