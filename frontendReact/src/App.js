import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Login from "./scenes/login";
import Dashboard from "./scenes/dashboard";
import PuntoVenta from "./scenes/puntoVenta";
import Facturas from "./scenes/facturas";
import Inventario from "./scenes/inventario";
import Gastos from "./scenes/gastos";
import Apartados from "./scenes/apartado";
import Cierre from "./scenes/cierre";
import Form from "./scenes/form";
import Estadisticas from "./scenes/estadisticas";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Desactiva el Sidebar para la ruta de login
    if (location.pathname !== '/login') {
      setIsSidebar(true);
    } else {
      setIsSidebar(false);
    }
  }, [location]);


  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
            <div className="app">
              {isSidebar && <Sidebar />}
              <main className="content">
                <Topbar setIsSidebar={setIsSidebar} />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={
                    <ProtectedRoute allowedRoles={['admin', 'master']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/puntoventa" element={
                    <ProtectedRoute allowedRoles={['admin', 'master', 'vendedor']}>
                      <PuntoVenta />
                    </ProtectedRoute>
                  } />
                  <Route path="/facturas" element={
                    <ProtectedRoute allowedRoles={['admin', 'master', 'vendedor']}>
                      <Facturas />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventario" element={
                    <ProtectedRoute allowedRoles={['admin', 'master']}>
                      <Inventario />
                    </ProtectedRoute>
                  } />
                  <Route path="/gastos" element={
                    <ProtectedRoute allowedRoles={['admin', 'master', 'vendedor']}>
                      <Gastos />
                    </ProtectedRoute>
                  } />
                  <Route path="/apartados" element={
                    <ProtectedRoute allowedRoles={['admin', 'master', 'vendedor']}>
                      <Apartados />
                    </ProtectedRoute>
                  } />
                  <Route path="/cierre" element={
                    <ProtectedRoute allowedRoles={['admin', 'master', 'vendedor']}>
                      <Cierre />
                    </ProtectedRoute>
                  } />
                  <Route path="/form" element={
                    <ProtectedRoute allowedRoles={['admin', 'master']}>
                      <Form />
                    </ProtectedRoute>
                  } />
                  <Route path="/estadisticas" element={
                    <ProtectedRoute allowedRoles={['admin', 'master']}>
                      <Estadisticas />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
            </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>

  );
}

export default App;
