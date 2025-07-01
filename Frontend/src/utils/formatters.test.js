// Contenido completo para: Frontend/src/utils/formatters.test.js

import { formatCurrency, formatQuantity } from './formatters';

// Suite de pruebas para formateadores de números
describe('Funciones de Formato', () => {

    // Pruebas para formatCurrency
    describe('formatCurrency', () => {
        test('debería formatear un número como moneda colombiana sin decimales', () => {
            // Usamos una expresión regular para ignorar el espacio que a veces añade el navegador
            expect(formatCurrency(15000)).toMatch(/\$\s?15.000/);
        });

        test('debería formatear un número grande con separadores de miles', () => {
            expect(formatCurrency(1250000)).toMatch(/\$\s?1.250.000/);
        });

        test('debería devolver "$ 0" para una entrada no válida', () => {
            expect(formatCurrency('abc')).toBe('$ 0');
        });
    });

    // Pruebas para formatQuantity
    describe('formatQuantity', () => {
        test('debería formatear un número entero con separador de miles', () => {
            expect(formatQuantity(5000)).toBe('5.000');
        });

        test('debería formatear un número decimal correctamente', () => {
            // En formato colombiano, la coma es el separador decimal
            expect(formatQuantity(1250.5)).toBe('1.250,5');
        });

        test('debería devolver "0" para una entrada no válida', () => {
            expect(formatQuantity(null)).toBe('0');
        });
    });
});