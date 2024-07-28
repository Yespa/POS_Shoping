import React, { useState, useEffect } from 'react';
import { Box, useTheme, Typography, Stack, TextField, Autocomplete, ToggleButton, ToggleButtonGroup, Snackbar, Alert, Button, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import EditIcon from '@mui/icons-material/Edit';
import CachedIcon from '@mui/icons-material/Cached';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';

import PrintFactura from './printFactura';
import PaymentDialogEdit from './PaymentDialogEdit';

const PedidoModal = ({ facturaOrig, handleCloseModal }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const clienteInicial = facturaOrig.cliente
  const productosVendidosInicial = facturaOrig.productosVendidos
  const totalFacturaInicial = facturaOrig.totalFactura

  const [cliente, setCliente] = useState(clienteInicial);
  const [opciones, setOpciones] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [busquedaTipo, setBusquedaTipo] = useState('nombre');
  const [productosVendidos, setProductosVendidos] = useState(productosVendidosInicial);
  const [totalFactura, setTotalFactura] = useState(totalFacturaInicial);
  const [openDialogPago, setOpenDialogPago] = useState(false);
  const [ventaResumen, setVentaResumen] = useState(null);
  const [facturaParaImprimir, setFacturaParaImprimir] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [errores, setErrores] = useState({
    nombre: '',
    docIdentidad: '',
    telefono: ''
  });

  const validarInfoCliente = () => {
    let esValido = true;
    let erroresTemp = { nombre: '', docIdentidad: '', telefono: '' };
  
    if (!cliente.nombre.trim()) {
      erroresTemp.nombre = 'El nombre no puede estar vacío.';
      esValido = false;
    }
    if (!cliente.docIdentidad.trim()) {
      erroresTemp.docIdentidad = 'La identificación no puede estar vacía.';
      esValido = false;
    }
    if (!cliente.telefono.trim()) {
      erroresTemp.telefono = 'El teléfono no puede estar vacío.';
      esValido = false;
    }
  
    setErrores(erroresTemp);
    return esValido;
  };

  const handleSelectProducto = (event, newValue) => {
    const opcionSeleccionada = opciones.find(opcion => opcion.nombre === newValue || opcion === newValue);
  
    if (opcionSeleccionada) {
      const productoExistenteIndex = productosVendidos.findIndex(p => p._id === opcionSeleccionada._id);
  
      if (productoExistenteIndex !== -1) {
        const nuevosProductos = [...productosVendidos];
        nuevosProductos[productoExistenteIndex].cantidad += 1;
        nuevosProductos[productoExistenteIndex].precio_total = nuevosProductos[productoExistenteIndex].precio_unitario_venta * nuevosProductos[productoExistenteIndex].cantidad;
        setProductosVendidos(nuevosProductos);
      } else {
        setProductosVendidos([...productosVendidos, {
          ...opcionSeleccionada,
          cantidad: 1,
          precio_total: opcionSeleccionada.precio_sugerido,
          precio_unitario_venta: opcionSeleccionada.precio_sugerido
        }]);
      }
    } else {
      console.log("Selección no válida, ignora el evento Enter");
    }
    setInputValue('');
    setSelectedValue(null);
  };

  const buscarProductos = async (busqueda) => {
    if (busqueda.length < 3) {
      setOpciones([]);
      return;
    }

    let url = `${API_URL}/productos/buscar?`;
    if (busquedaTipo === 'nombre') {
      url += `nombre=${encodeURIComponent(busqueda)}`;
    } else if (busquedaTipo === 'codigo') {
      url += `codigo=${encodeURIComponent(busqueda)}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const productos = await response.json();
      setOpciones(productos);
    } catch (error) {
      console.error("No se pudo obtener los productos", error);
    }
  };

  const handleBusquedaTipoChange = (_, newBusquedaTipo) => {
    if (newBusquedaTipo !== null) {
      setBusquedaTipo(newBusquedaTipo);
    }
  };

  const handleChange = (event) => {
    setCliente({ ...cliente, [event.target.name]: event.target.value });
  };

  const handleRefresh = () => {
    setCliente(clienteInicial);
  };

  const handleUpdate = (id) => {
    const nuevosProductos = productosVendidos.map((producto) => {
      if (producto._id === id) {
        return {
          ...producto,
          cantidad: 1,
          precio_unitario_venta: producto.precio_sugerido,
          precio_total: producto.precio_sugerido
        };
      }
      return producto;
    });
    setProductosVendidos(nuevosProductos);
  };

  const handleDeleteClick = (id) => {
    const nuevosProductos = productosVendidos.filter(producto => producto._id !== id);
    setProductosVendidos(nuevosProductos);
  };

  const handleCellEditCommit = React.useCallback((params) => {
    const nuevosProductos = productosVendidos.map((producto) => {
      if (producto._id === params.id) {
        if (params.field === 'cantidad') {
          const nuevoValor = Number(params.value);
          if (nuevoValor === 0) {
            openSnackbar("La cantidad no puede ser cero. Estableciendo cantidad a uno.", "warning");
            return {
              ...producto,
              cantidad: 1,
              precio_total: producto.precio_unitario_venta,
            };
          } else {
            return {
              ...producto,
              cantidad: nuevoValor,
              precio_total: nuevoValor * producto.precio_unitario_venta,
            };
          }
        } else if (params.field === 'precio_unitario_venta') {
          const nuevoPrecioUnitario = Number(params.value);
          return {
            ...producto,
            precio_unitario_venta: nuevoPrecioUnitario,
            precio_total: producto.cantidad * nuevoPrecioUnitario,
          };
        }
      }
      return producto;
    });
    setProductosVendidos(nuevosProductos);
  }, [productosVendidos]);

  const handleCancelarCompra = () => {
    setCliente(clienteInicial);
    setProductosVendidos([]);
    setOpciones([]);
    setInputValue('');
    setSelectedValue(null);
    setBusquedaTipo('nombre');
    handleCloseModal();
  };

  const handleAbrirDialogPago = () => {
    if (totalFactura === 0){
      openSnackbar("No se puede procesar el pago con total de factura en cero.", "error");
      return;
    }else if (validarInfoCliente()) {
      const ventaResumen = {
        cliente: cliente,
        productosVendidos: productosVendidos
      };
      setVentaResumen(ventaResumen);
      setOpenDialogPago(true);
    }
  };

  const handleCerrarDialogPago = () => {
    setOpenDialogPago(false);
  };

  const editarFactura = async (editedFactura) => {
    try {

      const productos = {
        productosActuales: productosVendidosInicial,
        productosEditados: editedFactura.productosVendidos
      }

      const responseUpdate = await fetch(`${API_URL}/productos/procesarEdicion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productos)
      });

      const updateMsg = await responseUpdate.json();

      if (!responseUpdate.ok) {
        throw new Error(`Unidades insuficientes en inventario | ${updateMsg.mensaje}`);
      }

      const response = await fetch(`${API_URL}/facturas/${editedFactura._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedFactura)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la factura');
      }
      const facturaEditada = await response.json();

      setFacturaParaImprimir(facturaEditada);
      imprimirFactura(facturaEditada);

      openSnackbar("Se actualizó la factura exitosamente", "success");
      handleCancelarCompra()

    } catch (error) {
      console.error('Error:', error);
      openSnackbar(`Falló la actualización de la factura ${error.message}`, "error");
    }
  };
  
  const imprimirFactura = (datosFactura) => {
    setTimeout(() => {
      const ventanaImpresion = window.open('', '_blank', 'width=50mm');
      ventanaImpresion.document.write(`
        <html>
        <head>
          <title>Impresión de Factura</title>
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
          </style>
        </head>
        <body>
          ${document.getElementById('facturaParaImprimir').innerHTML}
        </body>
        </html>
      `);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
    }, 500);
  };

  const columns = [
    { field: "codigo", headerName: "Código" },
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "cantidad",
      headerName: "Cantidad",
      flex: 1,
      type: "number",
      editable: true
    },
    {
      field: "precio_unitario_venta",
      headerName: "Precio unidad",
      type: "number",
      flex: 1,
      editable: true
    },
    {
      field: "precio_total",
      headerName: "Precio total",
      type: "number",
      flex: 1,
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      type: 'actions',
      getActions: (params) => [
        <IconButton
          color="secondary"
          aria-label="update"
          onClick={() => handleUpdate(params.id)}
        >
          <CachedIcon />
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

  const openSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  useEffect(() => {
    const total = productosVendidos.reduce((sum, producto) => sum + producto.precio_total, 0);
    setTotalFactura(total);
  }, [productosVendidos]);

  return (
    <Box m="5px">
      <Box sx={{
          p: 2,
          bgcolor: colors.primary[400],
          borderRadius: 3,
          boxShadow: 4,
        }}>
        <Typography variant="h5" component="div" 
          sx={{ 
            mb: 2,
            fontWeight: 'bold',
            color: 'primary' 
          }}>
          Editando factura con id: {facturaOrig._id}
        </Typography>
        <Typography variant="h6" component="div" 
          sx={{ 
            mb: 2,
            fontWeight: 'bold',
            color: 'primary' 
          }}>
          Información del Cliente
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <TextField
            name="nombre"
            label="Nombre"
            variant="outlined"
            value={cliente.nombre}
            onChange={handleChange}
            error={!!errores.nombre}
            helperText={errores.nombre} 
            fullWidth
          />
          <TextField
            name="docIdentidad"
            label="Doc Identidad/NIT"
            variant="outlined"
            value={cliente.docIdentidad}
            onChange={handleChange}
            error={!!errores.docIdentidad}
            helperText={errores.docIdentidad}
            fullWidth
          />
          <TextField
            name="telefono"
            label="Teléfono"
            variant="outlined"
            value={cliente.telefono}
            onChange={handleChange}
            error={!!errores.telefono}
            helperText={errores.telefono}
            fullWidth
          />
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ 
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
            }}>
          Nombre</ToggleButton>
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
        <Autocomplete
          freeSolo
          options={opciones}
          getOptionLabel={(option) => 
            `${option.nombre} - Código: ${option.codigo} - Cantidad: ${option.cantidad}`
          }
          onInputChange={(_, newInputValue) => {
            if (newInputValue !== inputValue) {
              setInputValue(newInputValue);
              buscarProductos(newInputValue);
            }
          }}
          inputValue={inputValue}
          onChange={handleSelectProducto}
          value={selectedValue}
          renderInput={(params) => (
            <TextField {...params} label={`Buscar por ${busquedaTipo}`} variant="outlined" fullWidth />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
              <Typography variant="body1">{option.nombre}</Typography>
              <Typography variant="body2" color="textSecondary">Código: {option.codigo}</Typography>
              <Typography variant="body2" color="textSecondary">Cantidad: {option.cantidad}</Typography>
            </Box>
          )}
        />
      </Box>
      <Box
        height="40vh"
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
          boxShadow: 4,
          mt: 2
        }}
      >
        <DataGrid rows={productosVendidos} columns={columns} getRowId={(row) => row._id} onCellEditCommit={handleCellEditCommit}/>
      </Box>
      <Box sx={{
        mt: 2,
        p: 2,
        bgcolor: colors.primary[400],
        borderRadius: 3,
        boxShadow: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography
          variant="h3"
          component="div"
          sx={{
            fontWeight: 'bold',
            color: 'primary'
          }}
        >
          TOTAL FACTURA: 
          <Box component="span" sx={{ ml: 1, color: 'secondary.main' }}>
            {totalFactura.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
          </Box>
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<EditIcon />}
            onClick={handleAbrirDialogPago}
            sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' }, fontSize: '1rem' }}
          >
            Continuar edición
          </Button>
          {ventaResumen && (
            <PaymentDialogEdit
              open={openDialogPago}
              onClose={handleCerrarDialogPago}
              totalFactura={totalFactura}
              editarFactura={editarFactura}
              ventaResumen={ventaResumen}
              infoFacturaOrig={facturaOrig}
            />
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<CancelIcon />}
            onClick={handleCancelarCompra}
            sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, fontSize: '1rem' }}
          >
            Cancelar
          </Button>
          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
            <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Stack>
        <div id="facturaParaImprimir" style={{ display: "none" }}>
          {facturaParaImprimir && <PrintFactura datosFactura={facturaParaImprimir} />}
        </div>
      </Box>
    </Box>
  );
};

export default PedidoModal;
