// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
      token: localStorage.getItem('token') || '',
      name: localStorage.getItem('name') || '',
      role: localStorage.getItem('role') || '',
    });

    useEffect(() => {
        // Opcional: Verifica el token al cargar la app para validar la sesión
    }, []);

    const login = (token, name, role) => {
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('role', role);
      setAuthState({
          token,
          name,
          role,
      });
    };

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      setAuthState({
          token: '',
          name: '',
          role: '',
      });
    };

    return (
      <AuthContext.Provider value={{ ...authState, login, logout }}>
          {children}
      </AuthContext.Provider>
    );
};
