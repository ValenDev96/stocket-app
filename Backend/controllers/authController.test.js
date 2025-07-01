const { login } = require('./authController');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simulamos todas las librerías externas
jest.mock('../config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authController - login', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                contrasena: 'password123',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        // Limpiamos los mocks
        pool.query.mockClear();
        bcrypt.compare.mockClear();
        jwt.sign.mockClear();
    });

    // Test 1: Login exitoso
    test('debería devolver un token si las credenciales son correctas', async () => {
        // Arrange
        const usuarioDB = { id: 1, email: 'test@example.com', contrasena: 'hashedPassword', rol_nombre: 'Administrador' };
        pool.query.mockResolvedValue([[usuarioDB]]); // Simulamos que el usuario existe
        bcrypt.compare.mockResolvedValue(true); // Simulamos que la contraseña es correcta
        jwt.sign.mockReturnValue('fake_jwt_token'); // Simulamos la creación del token

        // Act
        await login(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith({
            token: 'fake_jwt_token',
            usuario: expect.any(Object),
        });
        expect(jwt.sign).toHaveBeenCalledTimes(1);
    });

    // Test 2: Contraseña incorrecta
    test('debería devolver un error 401 si la contraseña es incorrecta', async () => {
        // Arrange
        const usuarioDB = { id: 1, email: 'test@example.com', contrasena: 'hashedPassword' };
        pool.query.mockResolvedValue([[usuarioDB]]);
        bcrypt.compare.mockResolvedValue(false); // Simulamos que la contraseña NO coincide

        // Act
        await login(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas.' });
        expect(jwt.sign).not.toHaveBeenCalled(); // No se debe generar un token
    });

    // Test 3: Usuario no encontrado
    test('debería devolver un error 401 si el usuario no existe', async () => {
        // Arrange
        pool.query.mockResolvedValue([[]]); // Simulamos que la consulta no devuelve ningún usuario

        // Act
        await login(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas o usuario inactivo.' });
    });
});