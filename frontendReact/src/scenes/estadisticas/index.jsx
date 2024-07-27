import React, { useState, useCallback } from 'react';
import { Box, Stack, TextField, IconButton, Select, MenuItem, FormControl, InputLabel, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";

import SearchIcon from '@mui/icons-material/Search';

import Header from "../../components/Header";
import PieChart from "../../components/PieChart";

const Estadisticas = () => {
  const API_URL = process.env.REACT_APP_API_URL
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('ventas');
  const [chartData, setChartData] = useState([]);


  const handleChange = (event) => {
    setOpcionSeleccionada(event.target.value);
  };

  const generarColorHSLAleatorio = () => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
  };

  const realizarBusqueda = useCallback(async () => {
  if (!opcionSeleccionada) return; // Asegura que haya una opción seleccionada
    console.log(opcionSeleccionada)

    try {

      if (opcionSeleccionada === "ventas"){
          const url = `${API_URL}/facturas/tiposUtilidad?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
          const response = await fetch(url);
          const datosApi = await response.json();
          
          // Parseo de los datos de la API al formato requerido por PieChart
          const datosParseados = datosApi.map(item => ({
            id: item._id,
            label: item._id,
            value: item.totalUtilidad,
            color: generarColorHSLAleatorio() // Genera un color aleatorio para cada ítem
          }));
    
          setChartData(datosParseados);

      }else if (opcionSeleccionada === "gastos"){
        const url = `${API_URL}/gastos/totalGastosTipos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        const response = await fetch(url);
        const datosApi = await response.json();
        
        // Parseo de los datos de la API al formato requerido por PieChart
        const datosParseados = datosApi.map(item => ({
          id: item._id,
          label: item._id,
          value: item.totalGasto,
          color: generarColorHSLAleatorio() // Genera un color aleatorio para cada ítem
        }));

        setChartData(datosParseados);
      }

    } catch (error) {
      console.error("Error al obtener los datos del gráfico:", error);
    }
  }, [opcionSeleccionada, fechaInicio, fechaFin, API_URL]); // Asegúrate de que todas las dependencias estén listadas aquí

  return (
    <Box marginLeft="20px" marginRight="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ESTADISTICAS" />

        <Box sx={{
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

              {/* Selector de opciones */}
              <FormControl variant="outlined" sx={{ minWidth: 270 }}>
                <InputLabel id="selector-opcion-label">Seleccione una opción</InputLabel>
                <Select
                  labelId="selector-opcion-label"
                  id="selector-opcion"
                  value={opcionSeleccionada}
                  onChange={handleChange}
                  label="Seleccione una opción"
                >
                  <MenuItem value="ventas">Ventas</MenuItem>
                  <MenuItem value="gastos">Gastos</MenuItem>
                </Select>
              </FormControl>

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
            <Box sx={{ width: 700 }}></Box> {/* Ajusta el width según necesites */}

          </Stack>
        </Box>

      </Box>

      <Box height="75vh">
      <Box display="flex" flexDirection="column" alignItems="left" p={2}>
        {/* Título */}
        <Typography variant="h3" color={colors.grey[100]} gutterBottom>
          {opcionSeleccionada.charAt(0).toUpperCase() + opcionSeleccionada.slice(1)} {/* Capitaliza el título */}
        </Typography>
        {/* Subtítulo */}
        {opcionSeleccionada === "ventas" && (
          <Typography variant="subtitle1" color={colors.grey[300]}>
            Utilidad de cada tipo de producto
          </Typography>
        )}
      </Box>
        <PieChart data={chartData}/>
      </Box>
    </Box>
  );
};

export default Estadisticas;
