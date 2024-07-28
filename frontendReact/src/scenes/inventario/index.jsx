import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme, IconButton, Alert, Button, Snackbar, TextField, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import ConfirmDialog from "../../components/ConfirmDialog";
import AddProductDialog from "../../components/AddProductDialog";
import EditProductDialog from "../../components/EditProductDialog";
import HandlerTipos from "../../components/HandlerTipos";
import InfoInventario from "../../components/infoInventario";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FeedIcon from '@mui/icons-material/Feed';


const Inventario = () => {
  const API_URL = process.env.REACT_APP_API_URL
  const TIPO_PRODUCTO = process.env.REACT_APP_TIPO_PRODUCTO
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tiposOpen, setTiposDialogOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [dialogOpenInfoInventario, setDialogOpenInfoInventario] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [busquedaTipo, setBusquedaTipo] = useState('nombre');
  const [searchTerm, setSearchTerm] = useState('');
  const [infoInv, setInfoInv] = useState('');
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
    const productoAEliminar = productos.find(producto => producto._id === id);
    if (!productoAEliminar) {
      console.error("Producto no encontrado");
      return;
    }
    setProductoAEliminar(productoAEliminar);
    setDialogOpen(true);
  };

  const handleOpenInfoInventario = async() => {
    await obtenerTotalesInventario()
    setDialogOpenInfoInventario(true);
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

  const handleCloseDialogInfoInventario = () => {
    setDialogOpenInfoInventario(false);
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

  const obtenerProductos = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/productos/all?limite=15`);
      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }
      const data = await respuesta.json();
      setProductos(data);
    } catch (error) {
      setError(error.message);
      console.log("Error al obtener productos:", error);
    }
  }, [API_URL]);

  const obtenerTotalesInventario = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/productos/totales`);
      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }
      const data = await respuesta.json();
      setInfoInv(data);
    } catch (error) {
      setError(error.message);
      console.log("Error al obtener los totales de los productos:", error);
    }
  };

  const realizarBusqueda = async () => {

    let url = `${API_URL}/productos/buscar?`;
    if (busquedaTipo === 'nombre') {
      url += `nombre=${encodeURIComponent(searchTerm)}`;
    } else if (busquedaTipo === 'codigo') {
      url += `codigo=${encodeURIComponent(searchTerm)}`;
    }

    try {
      const response = await fetch(url);
      console.log(response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const productos = await response.json();
      console.log(productos)
      setProductos(productos);
    } catch (error) {
      console.error("No se pudo obtener los productos", error);
    }
  };
  
  const handleRefresh = () => {
    setSearchTerm('');
    obtenerProductos();
  };

  const handleEdit = (id) => {
    console.log(id)
    const product = productos.find(p => p._id === id);
    setProductToEdit(product);
    setEditDialogOpen(true);
  };
  
  const handleConfirmDelete = async (id) => {
    setDialogOpen(false);    
    // Realiza la petición de borrado al backend
    try {
      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
  
      console.log('Producto eliminado');
      obtenerProductos(); // Actualiza la lista de productos
      openSnackbar("Se ha eliminado el producto existosamente.", "success");
    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló la eliminación del producto", "error");
    }
  };

  const handleSaveProduct = async (nuevoProducto) => {
    console.log(nuevoProducto);
    try {
      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (!response.ok) {
        throw new Error('Error al agregar el producto');
      }

      console.log('Producto agregado');
      obtenerProductos();
      openSnackbar("Se guardó el producto exitosamente", "success");

    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló el guardado del producto", "error");
    }
  };

  const handleSaveEditedProduct = async (editedProduct) => {
    try {
      console.log(editedProduct);

      const response = await fetch(`${API_URL}/productos/${editedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProduct)
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
  
      console.log('Producto actualizado');
      obtenerProductos();
      openSnackbar("Producto actualizado exitosamente", "success");
  
    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló la actualización del producto", "error");
    }
  };
  
  useEffect(() => {
    obtenerProductos();
  }, [obtenerProductos]);

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
      field: "tipo_producto",
      headerName: "Tipo de Producto",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      flex: 1,
    },
    {
      field: "precio_inventario",
      headerName: "Precio Inventario",
      flex: 1,
      valueGetter: (params) => {
        return params.row.precio_inventario.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
    },
    {
      field: "precio_sugerido",
      headerName: "Precio Sugerido",
      flex: 1,
      valueGetter: (params) => {
        return params.row.precio_sugerido.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      type: 'actions',
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
        <Header title="INVENTARIO" />

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
              Buscar producto
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
            </ToggleButtonGroup>
          </Stack>

          {/* Contenedor principal para buscador, botones de búsqueda y botones de acción en la misma línea */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            {/* Buscador y botones de buscar y refresh */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
              <TextField
                label={`Buscar por ${busquedaTipo}`}
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
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
                }} 
                onClick={handleOpenAddDialog}
              >
                Agregar Producto
              </Button>
              <Button
                sx={{
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                  padding: "10px 20px",
                }}
                onClick={handleOpenInfoInventario}
              >
                <FeedIcon />
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

          <AddProductDialog
            open={addDialogOpen}
            onClose={handleCloseAddDialog}
            onSave={handleSaveProduct}
          />

          <HandlerTipos 
            open={tiposOpen}
            onClose={closeTiposDialog} 
            nameTipo={"Producto"}
            idTipo={TIPO_PRODUCTO}
          />

          <InfoInventario
            open={dialogOpenInfoInventario}
            handleClose={handleCloseDialogInfoInventario}
            InventarioInfo={infoInv}
          />
        </Box>

      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box
        m="20px 0 0 0"
        height="72vh"
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
          rows={productos}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
        />
        <EditProductDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveEditedProduct}
          productToEdit={productToEdit}
        />
        <ConfirmDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
          nameItem={"producto"}
          item={productoAEliminar}
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

export default Inventario;
