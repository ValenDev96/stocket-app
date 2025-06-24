const pool = require('../config/db');

/**
 * @description Obtiene todos los registros de horas trabajadas.
 */
exports.obtenerHoras = async (req, res) => {
    try {
        const query = `
            SELECT 
                rh.id, 
                u.nombre_usuario,
                rh.empleado_id, 
                DATE(rh.fecha_hora_ingreso) as fecha, 
                TIME(rh.fecha_hora_ingreso) as hora_inicio, 
                TIME(rh.fecha_hora_salida) as hora_fin, 
                rh.horas_trabajadas as total_horas
            FROM registro_horas rh
            LEFT JOIN usuarios u ON rh.empleado_id = u.empleado_id
            ORDER BY rh.fecha_hora_ingreso DESC
        `;
        const [registros] = await pool.query(query);
        res.status(200).json(registros);
    } catch (error) {
        console.error("Error al obtener horas trabajadas:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @description Obtiene los registros de horas para un usuario específico.
 */
exports.obtenerPorUsuario = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const query = `
            SELECT 
                rh.id, u.nombre_usuario, rh.empleado_id,
                DATE(rh.fecha_hora_ingreso) as fecha, 
                TIME(rh.fecha_hora_ingreso) as hora_inicio, 
                TIME(rh.fecha_hora_salida) as hora_fin, 
                rh.horas_trabajadas as total_horas
            FROM registro_horas rh
            LEFT JOIN usuarios u ON rh.empleado_id = u.empleado_id
            WHERE u.empleado_id = ?
            ORDER BY rh.fecha_hora_ingreso DESC
        `;
        const [registros] = await pool.query(query, [usuario_id]);
        res.status(200).json(registros);
    } catch (error) {
        console.error("Error al obtener horas por usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @description Registra un nuevo turno de trabajo.
 */
exports.registrarHora = async (req, res) => {
    const { empleado_id, fecha, hora_inicio, hora_fin } = req.body;

    if (!empleado_id || !fecha || !hora_inicio) {
        return res.status(400).json({ message: 'Empleado, fecha y hora de inicio son obligatorios.' });
    }

    const fecha_hora_ingreso = `${fecha} ${hora_inicio}`;
    let fecha_hora_salida = null;
    let horas_trabajadas = null;

    if (hora_fin) {
        fecha_hora_salida = `${fecha} ${hora_fin}`;
        const inicio = new Date(fecha_hora_ingreso);
        const fin = new Date(fecha_hora_salida);
        if (fin > inicio) {
            horas_trabajadas = ((fin - inicio) / (1000 * 60 * 60)).toFixed(2);
        }
    }

    try {
        const query = `
            INSERT INTO registro_horas (empleado_id, fecha_hora_ingreso, fecha_hora_salida, horas_trabajadas) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [empleado_id, fecha_hora_ingreso, fecha_hora_salida, horas_trabajadas]);
        
        res.status(201).json({ message: 'Registro de hora creado exitosamente.', insertId: result.insertId });
    } catch (error) {
        console.error("Error al registrar hora:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @description Actualiza un registro de hora existente.
 */
exports.actualizarHora = async (req, res) => {
    const { id } = req.params;
    const { empleado_id, fecha, hora_inicio, hora_fin } = req.body;

    if (!empleado_id || !fecha || !hora_inicio) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const fecha_hora_ingreso = `${fecha} ${hora_inicio}`;
    let fecha_hora_salida = null;
    let horas_trabajadas = null;

    if (hora_fin) {
        fecha_hora_salida = `${fecha} ${hora_fin}`;
        const inicio = new Date(fecha_hora_ingreso);
        const fin = new Date(fecha_hora_salida);
        if (fin > inicio) {
            horas_trabajadas = ((fin - inicio) / (1000 * 60 * 60)).toFixed(2);
        }
    }

    try {
        const query = `
            UPDATE registro_horas 
            SET empleado_id = ?, fecha_hora_ingreso = ?, fecha_hora_salida = ?, horas_trabajadas = ? 
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [empleado_id, fecha_hora_ingreso, fecha_hora_salida, horas_trabajadas, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro no encontrado.' });
        }
        res.status(200).json({ message: 'Registro de hora actualizado exitosamente.' });
    } catch (error) {
        console.error("Error al actualizar hora:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @description Elimina un registro de hora.
 */
exports.eliminarHora = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM registro_horas WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro no encontrado.' });
        }
        res.status(200).json({ message: 'Registro de hora eliminado exitosamente.' });
    } catch (error) {
        console.error("Error al eliminar hora:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};