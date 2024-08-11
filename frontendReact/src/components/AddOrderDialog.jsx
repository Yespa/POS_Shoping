import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText, Stack, Typography, Box, IconButton, Autocomplete, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Delete as DeleteIcon } from '@mui/icons-material';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

const AddOrderDialog = ({ open, onClose, onSave }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const TIPO_PRODUCTO = process.env.REACT_APP_TIPO_PRODUCTO;
  const [newProducts, setNewProducts] = useState([{
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo_producto: '',
    cantidad: 0,
    precio_inventario: 0,
    precio_sugerido: 0
  }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [busquedaTipo, setBusquedaTipo] = useState('nombre');
  const [productos, setProductos] = useState([]);
  const [tiposProducto, setTiposProducto] = useState([]);
  const [errors, setErrors] = useState({});

  const cargarTiposProducto = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/tipos/${TIPO_PRODUCTO}`);
      const datos = await respuesta.json();
      setTiposProducto(datos.tipos);
    } catch (error) {
      console.error('Error al cargar tipos de producto:', error);
    }
  }, [API_URL, TIPO_PRODUCTO]);

  useEffect(() => {
    if (open) {
      cargarTiposProducto();
    }
  }, [open, cargarTiposProducto]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...newProducts];
    if (name === "precio_inventario" || name === "precio_sugerido") {
      const valorSinFormato = value.replace(/\D/g, '');
      const numero = valorSinFormato === '' ? 0 : parseInt(valorSinFormato, 10);
      updatedProducts[index][name] = numero;
    } else {
      updatedProducts[index][name] = value;
    }
    setNewProducts(updatedProducts);
  };

  const handleSelectProduct = (index, product) => {
    const updatedProducts = [...newProducts];
    updatedProducts[index] = { ...product, cantidad: 0, precio_inventario: 0, precio_sugerido: 0 };
    setNewProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    setNewProducts([...newProducts, {
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo_producto: '',
      cantidad: 0,
      precio_inventario: 0,
      precio_sugerido: 0
    }]);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...newProducts];
    updatedProducts.splice(index, 1);
    setNewProducts(updatedProducts);
  };

  const validate = async () => {
    let tempErrors = {};
    for (let i = 0; i < newProducts.length; i++) {
      const product = newProducts[i];
      if (product.codigo !== '') {
        const productCode = await validateCode(product.codigo);
        if (productCode && productCode._id && productCode._id !== product._id) {
          tempErrors[`codigo${i}`] = `El código ya está siendo usado por otro producto - ${productCode.nombre}`;
        } else {
          tempErrors[`codigo${i}`] = "";
        }
      } else {
        tempErrors[`codigo${i}`] = "El código no puede estar vacío";
      }
      tempErrors[`nombre${i}`] = product.nombre ? "" : "El nombre no puede estar vacío.";
      tempErrors[`tipo_producto${i}`] = product.tipo_producto ? "" : "El tipo de producto no puede estar vacío.";
      tempErrors[`cantidad${i}`] = product.cantidad > 0 ? "" : "La cantidad debe ser mayor que 0.";
      tempErrors[`precio_inventario${i}`] = product.precio_inventario > 0 ? "" : "El precio de inventario debe ser mayor que 0.";
      tempErrors[`precio_sugerido${i}`] = product.precio_sugerido > 0 ? "" : "El precio sugerido debe ser mayor que 0.";
    }
    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === ""); // Retorna true si no hay errores
  };

  const validateAndConvertToInt = (value) => {
    if (typeof value === 'string') {
      const intValue = parseInt(value, 10);
      if (!isNaN(intValue)) {
        return intValue;
      }
    }
    return value;
  };
  
  const handleSave = async () => {
    if (await validate()) {
      const productosNuevos = newProducts.filter(producto => !productos.some(p => p.codigo === producto.codigo));
      const productosExistentes = newProducts.filter(producto => productos.some(p => p.codigo === producto.codigo));

      console.log("DATOS")
      console.log(productosNuevos)
      console.log(productosExistentes)

      // Actualizar productos existentes
      for (let producto of productosExistentes) {
        const productoExistente = productos.find(p => p.codigo === producto.codigo);

        console.log("CANTIDAD ACTUAL")
        console.log(productoExistente.cantidad)
        console.log("CANTIDAD DIGITADA")
        console.log(producto.cantidad)

        productoExistente.cantidad = validateAndConvertToInt(productoExistente.cantidad) + validateAndConvertToInt(producto.cantidad);
        productoExistente.precio_inventario = producto.precio_inventario;
        productoExistente.precio_sugerido = producto.precio_sugerido;

        console.log("Valor existente")
        console.log(productoExistente)


        await fetch(`${API_URL}/productos/${productoExistente._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productoExistente),

        });
      }

      // Agregar productos nuevos
      for (let producto of productosNuevos) {

        producto.cantidad = validateAndConvertToInt(producto.cantidad)

        console.log("Valor nuevo")
        console.log(producto)
        await fetch(`${API_URL}/productos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(producto),
        });
      }

      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNewProducts([{
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo_producto: '',
      cantidad: 0,
      precio_inventario: 0,
      precio_sugerido: 0
    }]);
    setErrors({});
  };

  const validateCode = async (code) => {
    try {
      const respuesta = await fetch(`${API_URL}/productos/buscar/${code}`);
      if (respuesta.status === 404) {
        return {}
      }
      const data = await respuesta.json();
      return data
    } catch (error) {
      console.log("Error al obtener productos:", error);
      return null
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const productos = await response.json();
      setProductos(productos);
    } catch (error) {
      console.error("No se pudo obtener los productos", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const totalCantidad = newProducts.reduce((acc, product) => acc + product.cantidad, 0);
  const totalPrecioInventario = newProducts.reduce((acc, product) => acc + (product.precio_inventario * product.cantidad), 0);
  const totalPrecioSugerido = newProducts.reduce((acc, product) => acc + (product.precio_sugerido * product.cantidad), 0);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>Agregar Pedido</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <ToggleButtonGroup
            color="primary"
            value={busquedaTipo}
            exclusive
            onChange={(_, newBusquedaTipo) => {
              if (newBusquedaTipo !== null) {
                setBusquedaTipo(newBusquedaTipo);
              }
            }}
          >
            <ToggleButton
              value="nombre"
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'warning.light',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'warning.main',
                  },
                },
                '&:not(.Mui-selected)': {
                  bgcolor: 'warning.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                  },
                },
              }}
            >
              Buscar por Nombre
            </ToggleButton>
            <ToggleButton
              value="codigo"
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'warning.light',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'warning.main',
                  },
                },
                '&:not(.Mui-selected)': {
                  bgcolor: 'warning.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                  },
                },
              }}
            >
              Buscar por Código
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Buscar Producto</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Tipo de Producto</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', width: 100 }}>Cantidad</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Precio Inventario</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Total Precio Inventario</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Precio Sugerido</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', width: 150 }}>Total Precio Sugerido</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', width: 30 }}>Acc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {newProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                  <Autocomplete
                    freeSolo
                    options={productos}
                    getOptionLabel={(option) => `${option.nombre} - Código: ${option.codigo}`}
                    onInputChange={(event, newInputValue) => {
                      setSearchTerm(newInputValue);
                      realizarBusqueda();
                    }}
                    inputValue={searchTerm}
                    onChange={(event, newValue) => handleSelectProduct(index, newValue)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Buscar producto" 
                        variant="outlined" 
                        fullWidth 
                        onKeyDown={handleKeyDown}
                      />
                    )}
                  />
                  </TableCell>
                  <TableCell>
                    <TextField
                      required
                      margin="dense"
                      label="Código"
                      type="text"
                      fullWidth
                      variant="outlined"
                      name="codigo"
                      error={Boolean(errors[`codigo${index}`])}
                      helperText={errors[`codigo${index}`]}
                      value={product.codigo}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      required
                      margin="dense"
                      label="Nombre"
                      type="text"
                      fullWidth
                      variant="outlined"
                      name="nombre"
                      error={Boolean(errors[`nombre${index}`])}
                      helperText={errors[`nombre${index}`]}
                      value={product.nombre}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      margin="dense"
                      label="Descripción"
                      type="text"
                      fullWidth
                      variant="outlined"
                      name="descripcion"
                      value={product.descripcion}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth required variant="outlined" margin="dense" error={Boolean(errors[`tipo_producto${index}`])}>
                      <InputLabel>Tipo de Producto</InputLabel>
                      <Select
                        label="Tipo de Producto"
                        name="tipo_producto"
                        value={product.tipo_producto}
                        onChange={(e) => handleChange(index, e)}
                      >
                        {tiposProducto.map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                        ))}
                      </Select>
                      {errors[`tipo_producto${index}`] && <FormHelperText>{errors[`tipo_producto${index}`]}</FormHelperText>}
                    </FormControl>
                  </TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <TextField
                      required
                      margin="dense"
                      label="Cantidad"
                      type="number"
                      fullWidth
                      variant="outlined"
                      name="cantidad"
                      error={Boolean(errors[`cantidad${index}`])}
                      helperText={errors[`cantidad${index}`]}
                      value={product.cantidad}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <TextField
                      required
                      margin="dense"
                      label="Precio Inventario"
                      type="text"
                      fullWidth
                      variant="outlined"
                      name="precio_inventario"
                      error={Boolean(errors[`precio_inventario${index}`])}
                      helperText={errors[`precio_inventario${index}`]}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      value={product.precio_inventario.toLocaleString('es-ES')}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <Typography variant="body1">
                      ${(product.precio_inventario * product.cantidad).toLocaleString('es-ES')}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <TextField
                      required
                      margin="dense"
                      label="Precio Sugerido"
                      type="text"
                      fullWidth
                      variant="outlined"
                      name="precio_sugerido"
                      error={Boolean(errors[`precio_sugerido${index}`])}
                      helperText={errors[`precio_sugerido${index}`]}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      value={product.precio_sugerido.toLocaleString('es-ES')}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <Typography variant="body1">
                      ${(product.precio_sugerido * product.cantidad).toLocaleString('es-ES')}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: 30 }}>
                    <IconButton color="error" onClick={() => handleRemoveProduct(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Stack direction="row" spacing={2}>
          <Box sx={{ display: 'inline-flex', boxShadow: 4, borderRadius: 2, padding: 2, backgroundColor: 'background.paper', marginY: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginRight: 1 }}>
              Total Cantidad:
            </Typography>
            <Typography sx={{ fontSize: '1.2rem', alignSelf: 'center' }}>
              {totalCantidad}
            </Typography>
          </Box>
          <Box sx={{ display: 'inline-flex', boxShadow: 4, borderRadius: 2, padding: 2, backgroundColor: 'background.paper', marginY: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginRight: 1 }}>
              Total Precio Inventario:
            </Typography>
            <Typography sx={{ fontSize: '1.2rem', alignSelf: 'center' }}>
              {totalPrecioInventario.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'inline-flex', boxShadow: 4, borderRadius: 2, padding: 2, backgroundColor: 'background.paper', marginY: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginRight: 1 }}>
              Total Precio Sugerido:
            </Typography>
            <Typography sx={{ fontSize: '1.2rem', alignSelf: 'center' }}>
              {totalPrecioSugerido.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button  
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddProduct}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' }}}>
            Agregar Producto
          </Button>
          <Button 
            variant="contained"
            startIcon={<CancelIcon />}
            onClick={handleClose}
            sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }}}>
            Cancelar
          </Button>
          <Button 
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' }}}>
            Guardar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrderDialog;
