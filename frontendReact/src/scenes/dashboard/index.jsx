import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, TextField, IconButton, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SearchIcon from '@mui/icons-material/Search';

import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";

const Dashboard = () => {
  const API_URL = process.env.REACT_APP_API_URL
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [totalVentas, setTotalVentas] = useState('');
  const [ventasEfectivo, setVentasEfectivo] = useState('');
  const [ventasTransferencia, setVentasTransferencia] = useState('');
  const [totalGastos, setTotalGastos] = useState('');
  const [utilidades, setUtilidades] = useState('');
  const [totalApartados, setTotalApartados] = useState('');
  const [abonoEfectivo, setAbonoEfectivo] = useState('');
  const [abonoTransferencia, setAbonoTransferencia] = useState('');
  const [topArticulosMasVendidos, setTopArticulosMasVendidos] = useState([]);
  const [topArticulosMenosVendidos, setTopArticulosMenosVendidos] = useState([]);
  const [topArticulosUtilidad, setTopArticulosUtilidad] = useState([]);
  const [datosVentasXMes, setDatosVentasXMes] = useState([]);
  const [datosGastosXMes, setDatosGastosXMes] = useState([]);
  const [datosUtilidadXMes, setDatosUtilidadXMes] = useState([]);
  const [datosLineChart, setDatosLineChart] = useState([]);


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

  const getUtilidades = async () => {
    try {

      const url = `${API_URL}/facturas/utilidad?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const response = await fetch(url);
      const infoTotales = await response.json();

      setUtilidades(infoTotales.diferencia)

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

  const getTopMenosVendidos = async () => {
    try {

      const url = `${API_URL}/facturas/topMin?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const response = await fetch(url);
      const infoTop = await response.json();

      console.log(infoTop)
      setTopArticulosMenosVendidos(infoTop)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getTopUtilidad = async () => {
    try {

      const url = `${API_URL}/facturas/topUtilidad?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const response = await fetch(url);
      const infoTop = await response.json();

      console.log(infoTop)

      setTopArticulosUtilidad(infoTop)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getVentasXMes = async () => {
    try {

      const url = `${API_URL}/facturas/totalFacturaMes`;
      const response = await fetch(url);
      const info = await response.json();

      console.log(info)

      setDatosVentasXMes(info)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getGastosXMes = async () => {
    try {

      const url = `${API_URL}/gastos/totalGastosMes`;
      const response = await fetch(url);
      const info = await response.json();

      console.log(info)

      setDatosGastosXMes(info)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const getUtilidadXMes = async () => {
    try {

      const url = `${API_URL}/facturas/totalUtilidadMes`;
      const response = await fetch(url);
      const info = await response.json();

      console.log(info)

      setDatosUtilidadXMes(info)
            
    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  };

  const transformarDatos = async () => {
    // Transformar cada conjunto de datos
    const transformar = async (datos, id, color) => ({
      id,
      color,
      data: datos.map(d => ({
        x: d.mes,
        y: d.totalFactura || d.totalValorGasto || d.utilidadTotal
      }))
    });

    const datosTransformados = [
      await transformar(datosVentasXMes, "Ventas", colors.blueAccent[700]),
      await transformar(datosGastosXMes, "Gastos", colors.redAccent[700]),
      await transformar(datosUtilidadXMes, "Utilidad", colors.greenAccent[700])
    ];
    setDatosLineChart(datosTransformados)
  };


  const realizarBusqueda = async () => {
    // Espera a que todas las solicitudes de datos se completen antes de proceder.
    try {
      await Promise.all([
        getTotalesFacturas(),
        getTotalesGastos(),
        getUtilidades(),
        getTotalesApartados(),
        getTopMasVendidos(),
        getTopMenosVendidos(),
        getTopUtilidad(),
        getGastosXMes(),
        getVentasXMes(),
        getUtilidadXMes(),
      ]);

      console.log(datosGastosXMes)
  
      // Solo después de que todas las solicitudes se han completado y el estado se ha actualizado,
      // llama a transformarDatos para asegurar que se utiliza el estado más reciente.
      transformarDatos();
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
      gridColumn:"span 3",
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
    const ahora = new Date();
    const añoActual = ahora.getFullYear();
    const mesActual = ahora.getMonth(); // getMonth() es 0-index, enero es 0.

    // Fecha de inicio como el primer día del mes actual
    const inicioMes = new Date(añoActual, mesActual, 1);
    const inicioFormato = `${inicioMes.getFullYear()}-${(inicioMes.getMonth() + 1).toString().padStart(2, '0')}-${inicioMes.getDate().toString().padStart(2, '0')}T00:00`;

    // Fecha de fin como el segundo día del mes actual
    const finMes = new Date(añoActual, mesActual + 1, 0);
    const finFormato = `${finMes.getFullYear()}-${(finMes.getMonth() + 1).toString().padStart(2, '0')}-${finMes.getDate().toString().padStart(2, '0')}T23:59`;

    setFechaInicio(inicioFormato);
    setFechaFin(finFormato);
  }, []);
  
  useEffect(() => {
    // Asegúrate de que tanto fechaInicio como fechaFin estén establecidos antes de llamar a realizarBusqueda
    if (fechaInicio && fechaFin) {
      realizarBusqueda();
    }
    // eslint-disable-next-line
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    // Esta es una condición de ejemplo, ajusta según tus necesidades.
    if (totalVentas !== '' && totalGastos !== '' && utilidades !== '' && datosVentasXMes.length > 0 && datosGastosXMes.length > 0 && datosUtilidadXMes.length > 0) {
      transformarDatos();
    }
    // eslint-disable-next-line
  }, [totalVentas, totalGastos, utilidades, datosVentasXMes, datosGastosXMes, datosUtilidadXMes]);
  

  return (
    <Box marginLeft="20px" marginRight="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" />

        <Box sx={{
            mb: 2,
            p: 2,
            bgcolor: colors.primary[400],
            borderRadius: 3,
            boxShadow: 4
        }}>

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

            {/* Botones de "Agregar Producto" y "Settings" */}
            <Stack direction="row" spacing={1}>
              <Button             
                sx={{
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                  fontWeight: "bold",
                  padding: "10px 20px",
                  marginRight: "10px",
                }}>
                <DownloadOutlinedIcon sx={{ mr: "10px" }} />
                Descargar Reporte
              </Button>

            </Stack>
          </Stack>
        </Box>

      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        columnGap="20px"
        rowGap="20px"
      >
        {/* ROW 1 */}

          <StatCard title="Ventas" value={totalVentas} icon={<PointOfSaleIcon />}>
            <Typography variant="body2" color={colors.grey[100]}>Efectivo: {ventasEfectivo.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Typography>
            <Typography variant="body2" color={colors.grey[100]}>Transferencia: {ventasTransferencia.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Typography>
          </StatCard>
          <StatCard title="Gastos" value={totalGastos} icon={<CreditCardIcon />} />
          <StatCard title="Utilidad" value={utilidades} icon={<MonetizationOnIcon />} />
          <StatCard title="Apartado" value={totalApartados} icon={<TrafficIcon />}>
            <Typography variant="body2" color={colors.grey[100]}>Efectivo: {abonoEfectivo.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Typography>
            <Typography variant="body2" color={colors.grey[100]}>Transferencia: {abonoTransferencia.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Typography>
          </StatCard>

        {/* ROW 2 */}
        <Box
          gridColumn="span 12"
          gridRow="span 3"
          boxShadow="0px 4px 12px rgba(0,0,0,0.2)"
          borderRadius="8px"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Histórico de Ventas - Gastos - Utilidad
              </Typography>
            </Box>
          </Box>
          <Box height="450px" m="-20px 0 0 0">
            <LineChart data={datosLineChart} isDashboard={true} />
          </Box>
        </Box>

        {/* ROW 3 */}
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
              Top 5 | Productos menos vendidos
            </Typography>
          </Box>
          {/* Contenedor desplazable para los artículos */}
          <Box
            sx={{
              overflowY: 'auto', // Permite desplazamiento vertical
              maxHeight: 'calc(100% - 48px)', // Ajusta la altura máxima para permitir el desplazamiento
            }}
          >
            {topArticulosMenosVendidos.map((producto) => (
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
              Top 5 | Articulos con más utilidad
            </Typography>
          </Box>
          {/* Contenedor desplazable para los artículos */}
          <Box
            sx={{
              overflowY: 'auto', // Permite desplazamiento vertical
              maxHeight: 'calc(100% - 48px)', // Ajusta la altura máxima para permitir el desplazamiento
            }}
          >
            {topArticulosUtilidad.map((producto) => (
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
                </Box>
                <Box
                  backgroundColor={colors.greenAccent[500]}
                  p="5px 10px"
                  borderRadius="4px"
                >
                  {producto.totalUtilidad.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
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
              Top 5 | Articulos más vendidos
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
    </Box>
  );
};

export default Dashboard;
