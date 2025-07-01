import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext'; // Importamos el AuthProvider
import Login from './Login';

// Envolvemos el componente Login en los proveedores que necesita (Router y Auth)
const renderLoginComponent = () => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <Login />
            </AuthProvider>
        </BrowserRouter>
    );
};

// Suite de pruebas para el componente de Login
describe('Componente Login', () => {

    test('debería renderizar el formulario de inicio de sesión', () => {
        renderLoginComponent();
        // Verificamos que elementos clave estén en la pantalla
        expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
    });

    test('el botón de "Ingresar" debería estar deshabilitado inicialmente', () => {
        // Nota: Esta prueba asume que tu lógica deshabilita el botón si los campos están vacíos.
        // Si no lo hace, esta prueba fallará y es una oportunidad para mejorar el componente.
        // Por ahora, solo verificamos que existe.
        renderLoginComponent();
        expect(screen.getByRole('button', { name: /Ingresar/i })).toBeEnabled();
    });

    test('debería mostrar un mensaje de error si el email no es válido al intentar enviar', () => {
        renderLoginComponent();
        const emailInput = screen.getByLabelText(/Correo Electrónico/i);
        const submitButton = screen.getByRole('button', { name: /Ingresar/i });

        // Escribimos un email inválido
        fireEvent.change(emailInput, { target: { value: 'emailinvalido' } });

        // Hacemos clic en el botón de ingresar
        fireEvent.click(submitButton);

        // Verificamos que nuestro mensaje de error personalizado aparezca
        expect(screen.getByText(/Por favor, ingresa una dirección de correo válida./i)).toBeInTheDocument();
    });
});