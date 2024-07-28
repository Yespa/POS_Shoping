import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, useTheme, IconButton, Alert, Snackbar, Stack, Typography, TextField, ToggleButton, ToggleButtonGroup, Modal, Fade, Backdrop } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DetailsFacture from '../../components/detailsFacture';
import PrintFactura from '../../components/printFactura';
import { AuthContext } from '../../components/AuthContext';
import PedidoModal from '../../components/PedidoModal';
import ConfirmDialog from "../../components/ConfirmDialog";

import EditIcon from '@mui/icons-material/Edit';
import PlagiarismIcon from '@mui/icons-material/Plagiarism';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';


const Facturas = () => {
  const { role: userRole } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [facturas, setFacturas] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [busquedaTipo, setBusquedaTipo] = useState('id');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [dialogOpenInfo, setDialogOpenInfo] = useState(false);
  const [dialogOpenConfirm, setDialogOpenConfirm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [facturaAEliminar, setFacturaAEliminar] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [facturaParaImprimir, setFacturaParaImprimir] = useState(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success" o "error"

  const handleOpenDialog = (factura) => {
    setFacturaSeleccionada(factura);
    setDialogOpenInfo(true);
  };

  const handleOpenModal = (factura) => {
    console.log(factura)
    setFacturaSeleccionada(factura);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    handleRefresh()
  };

  const handlePrint = (factura) => {
    console.log(factura)
    setFacturaParaImprimir(factura);
    imprimirFactura(factura);
  };

  const handleCloseDialog = () => {
    setDialogOpenInfo(false);
    setDialogOpenConfirm(false);
  };

  const openSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleBusquedaTipoChange = (event, newBusquedaTipo) => {
    if (newBusquedaTipo !== null) {
      setBusquedaTipo(newBusquedaTipo);
    }
  };
  
  const closeSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const obtenerFacturas = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/facturas/all?limite=100`);
      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }
      const data = await respuesta.json();
      setFacturas(data);
    } catch (error) {
      setError(error.message);
      console.log("Error al obtener facturas:", error);
    }
  }, [API_URL]);

  const realizarBusqueda = async () => {

    let url = `${API_URL}/facturas/buscar?`;
    
    switch (busquedaTipo) {
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
      const facturas = await response.json();
      console.log(facturas)
      setFacturas(facturas);
    } catch (error) {
      console.error("No se pudo obtener los facturas", error);
      openSnackbar("No se ha podido realizar la consulta", "error");

    }
  };
  
  const handleRefresh = () => {
    setSearchTerm('');
    setFechaFin('');
    setFechaInicio('');
    obtenerFacturas();
  };

  const handleDeleteClick = (id) => {
    const facturaAEliminar = facturas.find(factura => factura._id === id);
    console.log(facturaAEliminar)
    if (!facturaAEliminar) {
      console.error("Factura no encontrada");
      return;
    }
    setFacturaAEliminar(facturaAEliminar);
    setDialogOpenConfirm(true);
  };

  const handleConfirmDelete = async (id) => {
    setDialogOpenConfirm(false);    
    // Realiza la petición de borrado al backend
    console.log(id)
    try {
      const response = await fetch(`${API_URL}/facturas/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar la factura');
      }
  
      console.log('Factura eliminada');
      obtenerFacturas(); // Actualiza la lista de facturas
      openSnackbar("Se ha eliminado la factura existosamente.", "success");
    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló la eliminación de la factura", "error");
    }
  };


  const imprimirFactura = (datosFactura) => {
    setTimeout(() => {
      const ventanaImpresion = window.open('', '_blank', 'width=80mm');
      ventanaImpresion.document.write(`
        <html>
        <head>
          <title>Impresión de Factura</title>
          <style>
            body, html {
              width: 58mm;
              font-family: 'Arial', sans-serif;
              lineHeight: '1.2';

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
          ${document.getElementById('facturaParaImprimir').innerHTML}
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
    obtenerFacturas();
  }, [obtenerFacturas]);

  const columns = [
    { field: "_id", headerName: "id", flex: 1, cellClassName: "name-column--cell" },
    {
      field: "fechaVenta",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (params) => {
        return new Date(params.row.fechaVenta).toLocaleString('es-CO', {
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
      field: "metodoPago",
      headerName: "Método Pago",
      flex: 1,
    },
    {
      field: "pagoTransferencia",
      headerName: "P. Transferencia",
      flex: 1,
      valueGetter: (params) => {
        return params.row.pagoTransferencia.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
    },
    {
      field: "banco",
      headerName: "Banco",
      flex: 1,
    },
    {
      field: "pagoEfectivo",
      headerName: "P. Efectivo",
      flex: 1,
      valueGetter: (params) => {
        return params.row.pagoEfectivo.toLocaleString('es-CO', {
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
      field: "vendedor",
      headerName: "Vendedor",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      flex: 1,
      type: 'actions',
      getActions: (params) => [
        ["admin", "master"].includes(userRole) && (
          <IconButton
            color="warning"
            aria-label="editar"
            onClick={() => handleOpenModal(params.row)}
          >
            <EditIcon />
          </IconButton>
        ),
        <IconButton
          color="secondary"
          aria-label="details"
          onClick={() => handleOpenDialog(params.row)}
        >
          <PlagiarismIcon />
        </IconButton>,
        <IconButton
          color="info"
          aria-label="imprimir"
          onClick={() => handlePrint(params.row)}
        >
          <PrintIcon/>
        </IconButton>,
        ["admin", "master"].includes(userRole) && (
          <IconButton
            color="error"
            aria-label="borrar"
            onClick={() => handleDeleteClick(params.id)}
          >
            <DeleteIcon />
          </IconButton>
        ),
      ].filter(Boolean),
    }
  ];
  

  return (
    <Box marginLeft="20px" marginRight="20px">

      <Box>
        {/* Título en la parte superior */}
        <Header title="FACTURAS" />

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
              Buscar factura
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
        height="75vh"
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
          rows={facturas}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
        />
        <DetailsFacture
          facturaInfo={facturaSeleccionada}
          open={dialogOpenInfo}
          handleClose={handleCloseDialog}
        />

        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={modalOpen}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
            }}>
              <PedidoModal 
                facturaOrig={facturaSeleccionada}
                handleCloseModal={handleCloseModal} 
              />
            </Box>
          </Fade>
        </Modal>

        <ConfirmDialog
          open={dialogOpenConfirm}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
          nameItem={"factura"}
          item={facturaAEliminar}
        />

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <div id="facturaParaImprimir" style={{ display: "none" }}>
          {facturaParaImprimir && <PrintFactura datosFactura={facturaParaImprimir} />}
        </div>
      </Box>
    </Box>
    
  );
};

export default Facturas;
