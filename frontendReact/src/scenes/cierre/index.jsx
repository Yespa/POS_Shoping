import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, TextField,  useTheme, IconButton } from "@mui/material";
import Header from "../../components/Header";

import { tokens } from "../../theme";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SearchIcon from '@mui/icons-material/Search';

const Cierre = () => {
  const API_URL = process.env.REACT_APP_API_URL
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [totalVentas, setTotalVentas] = useState('');
  const [ventasEfectivo, setVentasEfectivo] = useState('');
  const [ventasTransferencia, setVentasTransferencia] = useState('');
  const [ventasTransferenciaBancolombia, setVentasTransferenciaBancolombia] = useState(0);
  const [ventasTransferenciaNequi, setVentasTransferenciaNequi] = useState(0);
  const [totalGastos, setTotalGastos] = useState('');
  const [totalApartados, setTotalApartados] = useState('');
  const [abonoEfectivo, setAbonoEfectivo] = useState('');
  const [abonoTransferencia, setAbonoTransferencia] = useState('');
  const [abonoTransferenciaBancolombia, setAbonoTransferenciaBancolombia] = useState(0);
  const [abonoTransferenciaNequi, setAbonoTransferenciaNequi] = useState(0);
  const [topArticulosMasVendidos, setTopArticulosMasVendidos] = useState([]);

  const getTotalesFacturas = async () => {
    try {

      const url = `${API_URL}/facturas/totalFacturas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      console.log(url)
      const response = await fetch(url);
      const infoTotales = await response.json();

      setTotalVentas(infoTotales.sumaTotal)
      setVentasEfectivo(infoTotales.totalPagoEfectivo)
      setVentasTransferencia(infoTotales.totalPagoTransferencia)

      console.log(infoTotales)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getTotalesPagosTransferenciaXBanco = async () => {
    try {

      const url = `${API_URL}/facturas/totalTransferenciaXBanco?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const response = await fetch(url);
      const infoTotales = await response.json();

      const bancolombia = "bancolombia" in infoTotales ? infoTotales.bancolombia : 0;
      const nequi = "nequi" in infoTotales ? infoTotales.nequi : 0;

      setVentasTransferenciaBancolombia(bancolombia)
      setVentasTransferenciaNequi(nequi)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getTotalesGastos = async () => {
    try {

      const url = `${API_URL}/gastos/totalGastos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const response = await fetch(url);
      const infoTotales = await response.json();

      setTotalGastos(infoTotales.totalValorGasto)

      console.log(infoTotales)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getTotalesApartados = async () => {
    try {

      const url = `${API_URL}/apartados/totalesApartados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const response = await fetch(url);
      const infoTotales = await response.json();

      console.log(infoTotales)

      setTotalApartados(infoTotales.totalAbonado)
      setAbonoEfectivo(infoTotales.pagoEfectivo)
      setAbonoTransferencia(infoTotales.pagoTransferencia)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getTotalesAbonoTransferenciaXBanco = async () => {
    try {

      const url = `${API_URL}/apartados/totalTransferenciaXBanco?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const response = await fetch(url);
      const infoTotales = await response.json();

      const bancolombia = "bancolombia" in infoTotales ? infoTotales.bancolombia : 0;
      const nequi = "nequi" in infoTotales ? infoTotales.nequi : 0;

      setAbonoTransferenciaBancolombia(bancolombia)
      setAbonoTransferenciaNequi(nequi)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getTopMasVendidos = async () => {
    try {

      const url = `${API_URL}/facturas/topMax?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const response = await fetch(url);
      const infoTotales = await response.json();

      console.log(infoTotales)

      setTopArticulosMasVendidos(infoTotales)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const realizarBusqueda = async () => {
    // Espera a que todas las solicitudes de datos se completen antes de proceder.
    try {
      await Promise.all([
        getTotalesFacturas(),
        getTotalesGastos(),
        getTotalesApartados(),
        getTopMasVendidos(),
        getTotalesAbonoTransferenciaXBanco(),
        getTotalesPagosTransferenciaXBanco()
      ]);

    } catch (error) {
      console.error("Error al realizar la búsqueda:", error);
    }
  };


  const StatCard = ({ title, value, icon, children }) => (
    <Box sx={{
      backgroundColor: colors.primary[400],
      boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
      borderRadius: "8px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      mb: "20px",
      height: "auto",
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" color={theme.palette.secondary.main}>
            {title}
          </Typography>
          <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
            {value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
          </Typography>
        </Box>
        <Box sx={{ color: theme.palette.secondary.main, fontSize: "48px" }}>
          {icon}
        </Box>
      </Box>
      {children}
    </Box>
  );

  useEffect(() => {
    // Obtener la fecha actual
    const fechaActual = new Date();

    // Fecha de inicio del día actual (a las 00:00 horas)
    const inicioDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
    const inicioDiaFormato = `${inicioDia.getFullYear()}-${(inicioDia.getMonth() + 1).toString().padStart(2, '0')}-${inicioDia.getDate().toString().padStart(2, '0')}T00:00`;

    // Fecha de fin del día actual (a las 23:59 horas)
    const finDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 23, 59, 59);
    const finDiaFormato = `${finDia.getFullYear()}-${(finDia.getMonth() + 1).toString().padStart(2, '0')}-${finDia.getDate().toString().padStart(2, '0')}T23:59`;

    setFechaInicio(inicioDiaFormato);
    setFechaFin(finDiaFormato);
  }, []);

  useEffect(() => {
    // Asegúrate de que tanto fechaInicio como fechaFin estén establecidos antes de llamar a realizarBusqueda
    if (fechaInicio && fechaFin) {
      realizarBusqueda();
    }
    // eslint-disable-next-line
  }, [fechaInicio, fechaFin]);

  return (
    <Box marginLeft="20px" marginRight="20px">
      <Header title="CIERRE DE CAJA" />

      <Box sx={{
            p: 2,
            bgcolor: colors.primary[400],
            borderRadius: 3,
            boxShadow: 4,
        }}>
          {/* Título */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 'bold',
              color: 'primary',
              display: 'flex',
              alignItems: 'center',
            }}>
              Defina el rango que desee
            </Typography>

          </Stack>

          {/* Contenedor principal para buscador, botones de búsqueda y botones de acción en la misma línea */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            {/* Buscador y botones de buscar y refresh */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>

              
              {/* Campos de selección de fecha para cuando la opción 'fecha' esté seleccionada */}

              <TextField
                type="datetime-local"
                label="Fecha y hora de inicio"
                variant="outlined"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                type="datetime-local"
                label="Fecha y hora de fin"
                variant="outlined"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <IconButton
                sx={{
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                }}
                onClick={realizarBusqueda}
              >
                <SearchIcon />
              </IconButton>
            </Stack>

            {/* Espaciador */}
            <Box sx={{ width: 800 }}></Box> {/* Ajusta el width según necesites */}
          </Stack>


        </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
        }}
      >
        {/* Columna Ventas */}
        <Box>
          <Typography variant="h2" fontWeight="bold" color={theme.palette.secondary.main} mb={2}>
            Ventas
          </Typography>
          <StatCard title="Efectivo" value={ventasEfectivo} icon={<MonetizationOnIcon />} />
          <StatCard title="Transferencia" value={ventasTransferencia} icon={<CreditCardIcon />}>
            <Typography variant="body2" color={colors.grey[100]}>Bancolombia: {ventasTransferenciaBancolombia.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Typography>
            <Typography variant="body2" color={colors.grey[100]}>Nequi: {ventasTransferenciaNequi.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Typography>
          </StatCard>
          <StatCard title="Total Ventas" value={totalVentas} icon={<PointOfSaleIcon />} />

          {/* Contenedor del Top 5 | Articulos más vendidos con título fijo */}
          <Box
            gridColumn="span 4"
            gridRow="span 2"
            boxShadow="0px 4px 12px rgba(0,0,0,0.2)"
            borderRadius="8px"
            backgroundColor={colors.primary[400]}
            overflow="hidden" // Cambio para evitar el desplazamiento en el contenedor principal
            display="flex"
            flexDirection="column" // Organiza el contenido en una columna
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
              // Asegura que este Box no se desplace
            >
              <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
                Top 5 | Productos más vendidos
              </Typography>
            </Box>
            {/* Contenedor desplazable para los artículos */}
            <Box
              sx={{
                overflowY: 'auto', // Permite desplazamiento vertical
                maxHeight: 'calc(100% - 48px)', // Ajusta la altura máxima para permitir el desplazamiento
              }}
            >
              {topArticulosMasVendidos.map((producto) => (
                <Box
                  key={producto._id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottom={`4px solid ${colors.primary[500]}`}
                  p="15px"
                >
                  <Box>
                    <Typography
                      color={colors.greenAccent[500]}
                      variant="h5"
                      fontWeight="600"
                    >
                      {producto.nombre}
                    </Typography>
                    <Typography color={colors.grey[100]}>
                      Cantidad: {producto.totalVendido}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Columna Apartados */}
        <Box>
          <Typography variant="h2" fontWeight="bold" color={theme.palette.secondary.main} mb={2}>
            Apartados
          </Typography>
          <StatCard title="Abonos Efectivo" value={abonoEfectivo} icon={<AccountBalanceWalletIcon />} />
          <StatCard title="Abonos Transferencia" value={abonoTransferencia} icon={<CreditCardIcon />}>
            <Typography variant="body2" color={colors.grey[100]}>Bancolombia: {abonoTransferenciaBancolombia.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Typography>
            <Typography variant="body2" color={colors.grey[100]}>Nequi: {abonoTransferenciaNequi.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Typography>
          </StatCard>        
          <StatCard title="Total Apartados" value={totalApartados} icon={<ShoppingCartIcon />} />
          <Typography variant="h2" fontWeight="bold" color={theme.palette.secondary.main} mb={2}>
            Gastos
          </Typography>
          <StatCard title="Total Gastos" value={totalGastos} icon={<MoneyOffIcon />} /> 
        </Box>

      </Box>
    </Box>
  );
};

export default Cierre;
