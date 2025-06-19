const pool = require('../config/db');
// Obtener todos los clientes
exports.obtenerTodos = async (req, res) => {
    try {
        const [clientes] = await pool.query(`
            SELECT id, nombre, informacion_contacto, direccion, preferencias 
            FROM clientes 
            ORDER BY nombre ASC
        `);
        res.status(200).json(clientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear un nuevo cliente
exports.crearCliente = async (req, res) => {
    const { nombre, informacion_contacto, direccion, preferencias } = req.body;
    console.log('🛠️ Datos recibidos:', req.body); // LOG DE DEPURACIÓN
    try {
        const [resultado] = await pool.query(`
            INSERT INTO clientes (nombre, informacion_contacto, direccion, preferencias) 
            VALUES (?, ?, ?, ?)`,
            [nombre, informacion_contacto, direccion, preferencias]
        );
        res.status(201).json({
            id: resultado.insertId,
            nombre,
            informacion_contacto,
            direccion,
            preferencias
        });
    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ message: 'Error al crear cliente' });
    }
};


exports.actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, informacion_contacto, direccion, preferencias } = req.body;

    try {
        await pool.query(
            'UPDATE clientes SET nombre = ?, informacion_contacto = ?, direccion = ?, preferencias = ? WHERE id = ?',
            [nombre, informacion_contacto, direccion, preferencias, id]
        );
        res.status(200).json({ id, nombre, informacion_contacto, direccion, preferencias });
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

exports.eliminarCliente = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
        res.status(204).end();
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ message: 'Error al eliminar cliente' });
    }
};