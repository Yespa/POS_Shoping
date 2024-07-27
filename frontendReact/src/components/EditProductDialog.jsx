import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { green } from '@mui/material/colors';

const EditProductDialog = ({ open, onClose, onSave, productToEdit }) => {
  const API_URL = process.env.REACT_APP_API_URL
  const TIPO_PRODUCTO = process.env.REACT_APP_TIPO_PRODUCTO
  const [product, setProduct] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo_producto: '',
    cantidad: 0,
    precio_inventario: 0,
    precio_sugerido: 0
  });

  const [precioInventarioFormateado, setPrecioInventarioFormateado] = useState('');
  const [precioSugeridoFormateado, setPrecioSugeridoFormateado] = useState('');
  const [tiposProducto, setTiposProducto] = useState([]);
  const [errors, setErrors] = useState({});

  // Función para formatear números
  const formatNumber = (number) => {
    return number.toLocaleString('es-ES');
  };

  const validate = async () => {
    let tempErrors = {};
    if ( product.codigo !== ''){
      const productCode = await validateCode(product.codigo)
      console.log(productCode)
      if (Object.keys(productCode).length === 0 || product._id === productCode._id){
          tempErrors.codigo = ""
      }else{
          tempErrors.codigo = `El código ya está siendo usado por otro producto - ${productCode.nombre}`
      }
    }else{
        tempErrors.codigo = "El código no puede estar vacío, ni puede ser 0"
    }
    tempErrors.nombre = product.nombre ? "" : "El nombre no puede estar vacío.";
    tempErrors.tipo_producto = product.tipo_producto ? "" : "El tipo de producto no puede estar vacío.";
    tempErrors.cantidad = product.cantidad > 0 ? "" : "La cantidad debe ser mayor que 0.";
    tempErrors.precio_inventario = product.precio_inventario > 0 ? "" : "El precio de inventario debe ser mayor que 0.";
    tempErrors.precio_sugerido = product.precio_sugerido > 0 ? "" : "El precio sugerido debe ser mayor que 0.";

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === ""); // Retorna true si no hay errores
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "precio_inventario" || name === "precio_sugerido") {
      const valorSinFormato = value.replace(/\D/g, ''); // Elimina todo lo no numérico
      const numero = valorSinFormato === '' ? 0 : parseInt(valorSinFormato, 10);
      if (name === "precio_inventario") {
        setProduct({ ...product, precio_inventario: numero });
        setPrecioInventarioFormateado(formatNumber(numero));
      } else if (name === "precio_sugerido") {
        setProduct({ ...product, precio_sugerido: numero });
        setPrecioSugeridoFormateado(formatNumber(numero));
      }
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleSave = async () => {
    if (await validate()) {
      onSave(product);
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setProduct({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo_producto: '',
      cantidad: 0,
      precio_inventario: 0,
      precio_sugerido: 0
    });
    setTiposProducto([])
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
    if (productToEdit) {
      setProduct(productToEdit);
      // Aquí también debes formatear los precios al cargar el producto para editar
      setPrecioInventarioFormateado(formatNumber(productToEdit.precio_inventario));
      setPrecioSugeridoFormateado(formatNumber(productToEdit.precio_sugerido));
    }
  }, [open, productToEdit, cargarTiposProducto]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Producto</DialogTitle>
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
          value={product.codigo}
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
          value={product.nombre}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Descripción"
          type="text"
          fullWidth
          variant="outlined"
          name="descripcion"
          value={product.descripcion}
          onChange={handleChange}
        />
        <FormControl fullWidth required variant="outlined" margin="dense" error={Boolean(errors.tipo_producto)}>
          <InputLabel>Tipo de Producto</InputLabel>
          <Select
            label="Tipo de Producto"
            name="tipo_producto"
            value={product.tipo_producto}
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
          value={product.cantidad}
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

export default EditProductDialog;
