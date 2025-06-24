import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loginUser } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        try {
            const tokenGuardado = localStorage.getItem('token');
            const usuarioGuardado = localStorage.getItem('usuario');
            if (tokenGuardado && usuarioGuardado) {
                setUsuario(JSON.parse(usuarioGuardado));
            }
        } catch (error) {
            console.error("Fallo al cargar datos de sesión:", error);
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        } finally {
            setCargando(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        setUsuario(null);
    }, []);

    const login = useCallback(async (email, contrasena) => {
        try {
            const data = await loginUser({ email, contrasena });
            const { token, usuario } = data;
            localStorage.setItem('usuario', JSON.stringify(usuario));
            localStorage.setItem('token', token);
            setUsuario(usuario);
            return usuario;
        } catch (error) {
            logout();
            throw error;
        }
    }, [logout]);

    const value = { usuario, cargando, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {!cargando && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
