const { iniciarProduccion } = require('./produccionController');
const pool = require('../config/db');

// Simulamos el pool de conexiones de la base de datos
jest.mock('../config/db', () => ({
  getConnection: jest.fn().mockReturnThis(),
  beginTransaction: jest.fn(),
  query: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn(),
}));

// Suite de pruebas para el controlador de producción
describe('produccionController - iniciarProduccion', () => {
    let req, res, next;

    // Reiniciamos los mocks antes de cada prueba
    beforeEach(() => {
        req = {
            params: { id: 1 },
            usuario: { id: 1 } // Simulamos un usuario autenticado
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        // Limpiamos los mocks de la base de datos
        pool.getConnection.mockClear();
        pool.beginTransaction.mockClear();
        pool.query.mockClear();
        pool.commit.mockClear();
        pool.rollback.mockClear();
        pool.release.mockClear();
    });

    // Test 1: Caso de éxito
    test('debería iniciar la producción si hay stock suficiente', async () => {
        // Arrange: Simulamos las respuestas de la base de datos
        const loteDeProduccion = [{ id: 1, producto_terminado_id: 1, cantidad_producida: 10, estado: 'planificado' }];
        const receta = [{ materia_prima_id: 1, cantidad_receta: 5, stock_actual: 100 }]; // Hay 100, se necesitan 50
        
        pool.query
            .mockResolvedValueOnce([loteDeProduccion]) // Primera llamada (obtener lote)
            .mockResolvedValueOnce([receta])           // Segunda llamada (obtener receta)
            .mockResolvedValue([[]]);                  // Resto de llamadas (descuento, etc.)

        // Act
        await iniciarProduccion(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('La producción se ha iniciado')
        }));
        expect(pool.commit).toHaveBeenCalledTimes(1); // Se debe confirmar la transacción
        expect(pool.rollback).not.toHaveBeenCalled(); // No se debe revertir
    });

    // Test 2: Caso de fallo (stock insuficiente)
    test('debería devolver un error 400 si no hay stock suficiente', async () => {
        // Arrange
        const loteDeProduccion = [{ id: 1, producto_terminado_id: 1, cantidad_producida: 10, estado: 'planificado' }];
        const receta = [{ materia_prima_id: 1, cantidad_receta: 5, stock_actual: 40 }]; // Hay 40, se necesitan 50

        pool.query
            .mockResolvedValueOnce([loteDeProduccion])
            .mockResolvedValueOnce([receta]);

        // Act
        await iniciarProduccion(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('Stock insuficiente')
        }));
        expect(pool.commit).not.toHaveBeenCalled(); // No se debe confirmar
        expect(pool.rollback).toHaveBeenCalledTimes(1); // Se debe revertir la transacción
    });
});