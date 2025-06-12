// Crear este archivo en: src/context/AuthContext.js

import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null); // O inicialízalo desde localStorage

  // Lógica para iniciar sesión, cerrar sesión, etc.
  const login = (userData) => {
    setUsuario(userData);
    // Lógica para guardar en localStorage
  };

  const logout = () => {
    setUsuario(null);
    // Lógica para limpiar localStorage
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};