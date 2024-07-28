import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme, IconButton, Alert, Button, Snackbar, Stack, Typography, ToggleButton, ToggleButtonGroup, TextField } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import ConfirmDialog from "../../components/ConfirmDialog";
import AddGastoDialog from "../../components/AddGastoDialog";
import EditGastoDialog from "../../components/EditGastoDialog";
import HandlerTipos from "../../components/HandlerTipos";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const Gastos = () => {
  const API_URL = process.env.REACT_APP_API_URL
  const TIPO_GASTO = process.env.REACT_APP_TIPO_GASTO

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [gastos, setGastos] = useState([]);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tiposOpen, setTiposDialogOpen] = useState(false);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [gastoToEdit, setGastoToEdit] = useState(null);
  const [busquedaTipo, setBusquedaTipo] = useState('nombre');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success" o "error"

  const openSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const closeSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  const handleDeleteClick = (id) => {
    const gastoAEliminar = gastos.find(gasto => gasto._id === id);
    if (!gastoAEliminar) {
      console.error("Gasto no encontrado");
      return;
    }
    setGastoAEliminar(gastoAEliminar);
    setDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const openTiposDialog = () => {
    setTiposDialogOpen(true);
  };

  const closeTiposDialog = () => {
    setTiposDialogOpen(false);
  };

  const handleBusquedaTipoChange = (event, newBusquedaTipo) => {
    if (newBusquedaTipo !== null) { // Evita que se deseleccione todo
      setBusquedaTipo(newBusquedaTipo);
    }
  };

  const obtenerGastos= useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/gastos/all?limite=50`);
      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }
      const data = await respuesta.json();
      setGastos(data);
    } catch (error) {
      setError(error.message);
      console.log("Error al obtener gastos:", error);
    }
  }, [API_URL]);

  const realizarBusqueda = async () => {

    let url = `${API_URL}/gastos/buscar?`;
    
    switch (busquedaTipo) {
      case 'nombre':
        url += `nombre=${encodeURIComponent(searchTerm)}`;
        break;
      case 'codigo':
        url += `codigo=${encodeURIComponent(searchTerm)}`;
        break;
      case 'fecha':
        if (fechaInicio && fechaFin) {
          console.log(fechaInicio)
          console.log(fechaFin)
          url += `fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        }
        break;
      default:
        break;
    }

    try {
      const response = await fetch(url);
      console.log(response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const gastos = await response.json();
      console.log(gastos)
      setGastos(gastos);
    } catch (error) {
      console.error("No se pudo obtener los gastos", error);
    }
  };
  
  const handleRefresh = () => {
    setSearchTerm('');
    setFechaFin('');
    setFechaInicio('');
    obtenerGastos(); 
  };

  const handleEdit = (id) => {
    console.log(id)
    const gasto = gastos.find(p => p._id === id);
    setGastoToEdit(gasto);
    setEditDialogOpen(true);
  };
  
  const handleConfirmDelete = async (id) => {
    setDialogOpen(false);    
    // Realiza la petición de borrado al backend
    try {
      const response = await fetch(`${API_URL}/gastos/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el gasto');
      }
  
      console.log('Gasto eliminado');
      obtenerGastos(); // Actualiza la lista de gastos
      openSnackbar("Se ha eliminado el gasto existosamente.", "success");
    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló la eliminación del gasto", "error");
    }
  };

  const handleSaveGasto = async (nuevoGasto) => {
    console.log(nuevoGasto);
    try {
      const response = await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoGasto)
      });

      if (!response.ok) {
        throw new Error('Error al agregar el gasto');
      }

      console.log('Gasto agregado');
      obtenerGastos();
      openSnackbar("Se guardó el gasto exitosamente", "success");

    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló el guardado del gasto", "error");
    }
  };

  const handleSaveEditedGasto = async (editedGasto) => {
    try {
      console.log(editedGasto);

      const response = await fetch(`${API_URL}/gastos/${editedGasto._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedGasto)
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar el gasto');
      }
  
      console.log('Gasto actualizado');
      obtenerGastos();
      openSnackbar("Gasto actualizado exitosamente", "success");
  
    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló la actualización del gasto", "error");
    }
  };
  
  useEffect(() => {
    obtenerGastos();
  }, [obtenerGastos]);

  const columns = [
    { field: "codigo",
      headerName: "Código",
      flex: 0.5,
      cellClassName: "name-column--cell"
    },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "tipo_gasto",
      headerName: "Tipo de Gasto",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "valor_gasto",
      headerName: "Valor",
      flex: 1,
      valueGetter: (params) => {
        return params.row.valor_gasto.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
    },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (params) => {
        return new Date(params.row.fecha).toLocaleString('es-CO', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      },
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      type: 'actions',
      flex: 1,
      getActions: (params) => [
        <IconButton
          color="warning"
          aria-label="editar"
          onClick={() => handleEdit(params.id)}
        >
          <EditIcon />
        </IconButton>,
        <IconButton
          color="error"
          aria-label="borrar"
          onClick={() => handleDeleteClick(params.id)}
        >
          <DeleteIcon />
        </IconButton>
      ],
    }
  ];

  return (
    <Box marginLeft="20px" marginRight="20px">

      <Box>
        {/* Título en la parte superior */}
        <Header title="GASTOS" />

        <Box sx={{
            mt: 2, // Margen superior para separar del título
            p: 2,
            bgcolor: colors.primary[400],
            borderRadius: 3,
            boxShadow: 4,
        }}>
          {/* Título y ToggleButtonGroup en la primera línea */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 'bold',
              color: 'primary',
              display: 'flex',
              alignItems: 'center',
            }}>
              Buscar gasto
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={busquedaTipo}
              exclusive
              onChange={handleBusquedaTipoChange}
              size="small"
              sx={{ height: 'fit-content' }}
            >
              <ToggleButton value="nombre" sx={{
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}>Nombre</ToggleButton>
              <ToggleButton value="codigo" sx={{
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}>Código</ToggleButton>
              <ToggleButton value="fecha" sx={{
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}>Fecha</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Contenedor principal para buscador, botones de búsqueda y botones de acción en la misma línea */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            {/* Buscador y botones de buscar y refresh */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
            {busquedaTipo !== 'fecha' && (
                <TextField
                  label={`Buscar por ${busquedaTipo}`}
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
              )}
              
              {/* Campos de selección de fecha para cuando la opción 'fecha' esté seleccionada */}
              {busquedaTipo === 'fecha' && (
                <>
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
                </>
              )}

              <IconButton
                sx={{
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                }}
                onClick={realizarBusqueda}
              >
                <SearchIcon />
              </IconButton>
              <IconButton
                sx={{
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                }}
                onClick={handleRefresh}
              >
                <RefreshIcon />
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
              }} onClick={handleOpenAddDialog}>
              Agregar Gasto
            </Button>
            <Button
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                padding: "10px 20px",
              }}
              onClick={openTiposDialog}
            >
              <SettingsIcon />
            </Button>
            </Stack>
          </Stack>

          <AddGastoDialog
            open={addDialogOpen}
            onClose={handleCloseAddDialog}
            onSave={handleSaveGasto}
          />

          <HandlerTipos 
            open={tiposOpen}
            onClose={closeTiposDialog}
            nameTipo={"Gasto"}
            idTipo={TIPO_GASTO}
          />
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box
        m="20px 0 0 0"
        height="73vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={gastos}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
        />
        <EditGastoDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveEditedGasto}
          gastoToEdit={gastoToEdit}
        />
        <ConfirmDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
          nameItem={"gasto"}
          item={gastoAEliminar}
        />
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
    
  );
};

export default Gastos;
