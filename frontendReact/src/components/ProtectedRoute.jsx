// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, role } = useContext(AuthContext);

    if (!token || (allowedRoles && !allowedRoles.includes(role))) {
        // Usuario no autenticado o sin el rol necesario
        return <Navigate to="/login" replace />;
    }

    return children;
};


export default ProtectedRoute; // Exportación predeterminada
