import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme, IconButton, Alert, Snackbar, Stack, Typography, ToggleButton, ToggleButtonGroup, TextField } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DetailsApartado from '../../components/detailsApartado';
import PrintComprobante from '../../components/printComprobanteApartado';
import ConfirmDialog from "../../components/ConfirmDialog";


import PlagiarismIcon from '@mui/icons-material/Plagiarism';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';


const Apartados = () => {
  const API_URL = process.env.REACT_APP_API_URL
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [apartados, setApartados] = useState([]);
  const [apartadoSeleccionado, setApartadoSeleccionado] = useState(null);
  const [busquedaTipo, setBusquedaTipo] = useState('id');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenDelete, setDialogOpenDelete] = useState(false);
  const [comprobanteParaImprimir, setComprobanteParaImprimir] = useState(null);
  const [apartadoAEliminar, setApartadoAEliminar] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success" o "error"

  const handleOpenDialog = (apartado) => {
    setApartadoSeleccionado(apartado);
    console.log(apartado)
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogOpenDelete(false)
  };

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

  const handlePrint = (factura) => {
    console.log(factura)
    setComprobanteParaImprimir(factura);
    imprimirComprobante(factura);
  };

  const handleDeleteClick = (id) => {
    const apartadoAEliminar = apartados.find(apartado => apartado._id === id);
    if (!apartadoAEliminar) {
      console.error("Apartado no encontrado");
      return;
    }

    const infoConfirm = {
      _id: apartadoAEliminar._id,
      nombre: apartadoAEliminar.cliente.nombre
    }

    setApartadoAEliminar(infoConfirm);
    setDialogOpenDelete(true);
  };

  const handleConfirmDelete = async (id) => {
    setDialogOpenDelete(false);    
    // Realiza la petición de borrado al backend
    try {
      const response = await fetch(`${API_URL}/apartados/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el apartado');
      }
  
      console.log('Apartado eliminado');
      obtenerApartados(); // Actualiza la lista de apartados
      openSnackbar("Se ha eliminado el apartado existosamente.", "success");
    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló la eliminación del apartado", "error");
    }
  };

  const handleBusquedaTipoChange = (event, newBusquedaTipo) => {
    if (newBusquedaTipo !== null) {
      setBusquedaTipo(newBusquedaTipo);
    }
  };

  const obtenerApartados = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/apartados/all?limite=50`);
      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }
      const data = await respuesta.json();
      setApartados(data);
    } catch (error) {
      setError(error.message);
      console.log("Error al obtener apartados:", error);
    }
  }, [API_URL]);

  const realizarBusqueda = async () => {

    let url = `${API_URL}/apartados/buscar?`;
    
    switch (busquedaTipo) {
      case 'nombre cliente':
        url += `nombre=${encodeURIComponent(searchTerm)}`;
        break;
      case 'documento cliente':
        url += `docIdentidad=${encodeURIComponent(searchTerm)}`;
        break;
      case 'id':
        url += `id=${encodeURIComponent(searchTerm)}`;
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
      const apartados = await response.json();
      console.log(apartados)
      setApartados(apartados);
    } catch (error) {
      console.error("No se pudo obtener los apartados", error);
    }
  };
  
  const handleRefresh = () => {
    setSearchTerm('');
    setFechaFin('');
    setFechaInicio('');
    obtenerApartados();
  };

  const handleSaveEditedApartado = async (editedApartado) => {
    try {
      console.log(editedApartado);

      const response = await fetch(`${API_URL}/apartados/${editedApartado._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedApartado)
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar el apartado');
      }

      const comprobanteGuardado = await response.json();
      setComprobanteParaImprimir(comprobanteGuardado);
      imprimirComprobante(comprobanteGuardado);
  
      console.log('Apartado actualizado');
      obtenerApartados();
      openSnackbar("Apartado actualizado exitosamente", "success");
  
    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló la actualización del Apartado", "error");
    }
  };


  const imprimirComprobante = (datosApartado) => {
    setTimeout(() => {
      const ventanaImpresion = window.open('', '_blank', 'width=50mm');
      ventanaImpresion.document.write(`
        <html>
        <head>
          <title>Impresión de Comprobante</title>
          <style>
            body, html {
              width: 58mm;
              font-family: 'Arial', sans-serif;
            }
            img {
              max-width: 30mm;
              height: auto;
              margin-top: 5px;
              margin-bottom: 5px;
            }
            /* Añade aquí más estilos según sea necesario */
          </style>
        </head>
        <body>
          ${document.getElementById('comprobanteParaImprimir').innerHTML}
        </body>
        </html>
      `);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      // ventanaImpresion.print();
      // ventanaImpresion.close(); // Descomenta si deseas que la ventana se cierre automáticamente después de imprimir
    }, 500);
  }; 
  
  
  useEffect(() => {
    obtenerApartados();
  }, [obtenerApartados]);

  const columns = [
    { field: "_id",
      headerName: "id",
      flex: 1,
      cellClassName: "name-column--cell"
    },
    {
      field: "fechaApartado",
      headerName: "Fecha Apartado",
      flex: 1,
      valueGetter: (params) => {
        return new Date(params.row.fechaApartado).toLocaleString('es-CO', {
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
      field: "clienteNombre",
      headerName: "Nombre cliente",
      flex: 1,
      valueGetter: (params) => params.row.cliente?.nombre,
    },
    {
      field: "saldoPendiente",
      headerName: "Saldo Pendiente",
      flex: 1,
      valueGetter: (params) => {
        return params.row.saldoPendiente.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
    },
    {
      field: "totalAbonado",
      headerName: "Total Abonado",
      flex: 1,
      valueGetter: (params) => {
        return params.row.totalAbonado.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
    },
    {
      field: "totalFactura",
      headerName: "Total Factura",
      flex: 1,
      valueGetter: (params) => {
        return params.row.totalFactura.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1
    },
    {
      field: "vendedor",
      headerName: "Vendedor",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      type: 'actions',
      flex: 1,
      getActions: (params) => [
        <IconButton
          color="secondary"
          aria-label="editar"
          onClick={() => handleOpenDialog(params.row)}
        >
          <PlagiarismIcon />
        </IconButton>,
        <IconButton
        color="secondary"
          aria-label="imprimir"
          onClick={() => handlePrint(params.row)}
        >
        <PrintIcon/>
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
        <Header title="APARTADOS" />

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
              Buscar apartado
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={busquedaTipo}
              exclusive
              onChange={handleBusquedaTipoChange}
              size="small"
              sx={{ height: 'fit-content' }}
            >
              <ToggleButton value="id" sx={{
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}>ID</ToggleButton>
              <ToggleButton value="nombre cliente" sx={{
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}>Nombre cliente</ToggleButton>
              <ToggleButton value="documento cliente" sx={{
                '&.Mui-selected': {
                  color: 'white',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}>Documento cliente</ToggleButton>
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
          </Stack>
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
          rows={apartados}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
        />
        <DetailsApartado
          apartadoInfo={apartadoSeleccionado}
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveEditedApartado}

        />
        <ConfirmDialog
          open={dialogOpenDelete}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
          nameItem={"apartado"}
          item={apartadoAEliminar}
        />
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <div id="comprobanteParaImprimir" style={{ display: "none" }}>
          {comprobanteParaImprimir && <PrintComprobante datosApartado={comprobanteParaImprimir} />}
        </div>
      </Box>
    </Box>
    
  );
};

export default Apartados;
