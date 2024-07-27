import React, { useState, useEffect, useCallback } from 'react';

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { green } from '@mui/material/colors';

const AddProductDialog = ({ open, onClose, onSave }) => {
  const API_URL = process.env.REACT_APP_API_URL
  const TIPO_PRODUCTO = process.env.REACT_APP_TIPO_PRODUCTO
  const [newProduct, setNewProduct] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo_producto: '',
    cantidad: 0,
    precio_inventario: 0,
    precio_sugerido:0
  });

  const [precioInventarioFormateado, setPrecioInventarioFormateado] = useState('');
  const [precioSugeridoFormateado, setPrecioSugeridoFormateado] = useState('');
  const [tiposProducto, setTiposProducto] = useState([]);
  const [errors, setErrors] = useState({});

  const validate = async () => {
    let tempErrors = {};
    if ( newProduct.codigo !== ''){
        const productCode = await validateCode(newProduct.codigo)
        console.log(productCode)
        if (Object.keys(productCode).length === 0){
            tempErrors.codigo = ""
        }else{
            tempErrors.codigo = `El código ya está siendo usado por otro producto - ${productCode.nombre}`
        }
    }else{
        tempErrors.codigo = "El código no puede estar vacío"
    }
    tempErrors.nombre = newProduct.nombre ? "" : "El nombre no puede estar vacío.";
    tempErrors.tipo_producto = newProduct.tipo_producto ? "" : "El tipo de producto no puede estar vacío.";
    tempErrors.cantidad = newProduct.cantidad > 0 ? "" : "La cantidad debe ser mayor que 0.";
    tempErrors.precio_inventario = newProduct.precio_inventario > 0 ? "" : "El precio de inventario debe ser mayor que 0.";
    tempErrors.precio_sugerido = newProduct.precio_sugerido > 0 ? "" : "El precio sugerido debe ser mayor que 0.";
  
    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === ""); // Retorna true si no hay errores
  };

  const cargarTiposProducto = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/tipos/${TIPO_PRODUCTO}`);
      const datos = await respuesta.json();
      setTiposProducto(datos.tipos);
    } catch (error) {
      console.error('Error al cargar tipos de producto:', error);
    }
  }, [API_URL, TIPO_PRODUCTO]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "precio_inventario" || name === "precio_sugerido") {
      const valorSinFormato = value.replace(/\D/g, '');
      const numero = valorSinFormato === '' ? 0 : parseInt(valorSinFormato, 10);
      setNewProduct({ ...newProduct, [name]: numero });

      const formateador = new Intl.NumberFormat('es-ES');
      const valorConFormato = valorSinFormato ? formateador.format(numero) : '';
      if (name === "precio_inventario") {
        setPrecioInventarioFormateado(valorConFormato);
      } else if (name === "precio_sugerido") {
        setPrecioSugeridoFormateado(valorConFormato);
      }
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleSave = async () => {
    if (await validate()) {
      const productoAguardar = {
        ...newProduct,
        precio_inventario: Number(newProduct.precio_inventario),
        precio_sugerido: Number(newProduct.precio_sugerido)
      };
      onSave(productoAguardar);
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNewProduct({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo_producto: '',
      cantidad: 0,
      precio_inventario: 0,
      precio_sugerido: 0
    });
    setPrecioInventarioFormateado('')
    setPrecioSugeridoFormateado('')
    setTiposProducto([]);
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

  useEffect(() => {
    if (open){
      cargarTiposProducto();
    }
  }, [open, cargarTiposProducto]);
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar Nuevo Producto</DialogTitle>
      <DialogContent>
      <TextField
          required
          margin="dense"
          label="Código"
          type="text"
          fullWidth
          variant="outlined"
          name="codigo"
          error={Boolean(errors.codigo)}
          helperText={errors.codigo}
          value={newProduct.codigo}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          label="Nombre"
          type="text"
          fullWidth
          variant="outlined"
          name="nombre"
          error={Boolean(errors.nombre)}
          helperText={errors.nombre}
          value={newProduct.nombre}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Descripción"
          type="text"
          fullWidth
          variant="outlined"
          name="descripcion"
          value={newProduct.descripcion}
          onChange={handleChange}
        />
        <FormControl fullWidth required variant="outlined" margin="dense" error={Boolean(errors.tipo_producto)}>
          <InputLabel>Tipo de Producto</InputLabel>
          <Select
            label="Tipo de Producto"
            name="tipo_producto"
            value={newProduct.tipo_producto}
            onChange={handleChange}
          >
            {tiposProducto.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
            ))}
          </Select>
          {errors.tipo_producto && <FormHelperText>{errors.tipo_producto}</FormHelperText>}
        </FormControl>
        <TextField
          required
          margin="dense"
          label="Cantidad"
          type="number"
          fullWidth
          variant="outlined"
          name="cantidad"
          error={Boolean(errors.cantidad)}
          helperText={errors.cantidad}
          value={newProduct.cantidad}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          label="Precio Inventario"
          type="text"
          fullWidth
          variant="outlined"
          name="precio_inventario"
          error={Boolean(errors.precio_inventario)}
          helperText={errors.precio_inventario}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          value={precioInventarioFormateado}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          label="Precio Sugerido"
          type="text"
          fullWidth
          variant="outlined"
          name="precio_sugerido"
          error={Boolean(errors.precio_sugerido)}
          helperText={errors.precio_sugerido}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          value={precioSugeridoFormateado}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSave} variant="contained" sx={{ 
          backgroundColor: green[500],
          '&:hover': {
            backgroundColor: green[700],
          },
        }}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;
