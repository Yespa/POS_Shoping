import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableContainer,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { AuthContext } from './AuthContext';


const PaymentDialog = ({ open, onClose, totalFactura, procesarPago, ventaResumen }) => {
  const { name: userName } = useContext(AuthContext);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [bancoSeleccionado, setBancoSeleccionado] = useState('');
  const [efectivoEntregado, setEfectivoEntregado] = useState('');
  const [pagoTransferencia, setPagoTransferencia] = useState('');
  const [devuelta, setDevuelta] = useState(0);
  const [valorFormateadoEfectivo, setValorFormateadoEfectivo] = useState('');
  const [valorFormateadoTransferencia, setValorFormateadoTransferencia] = useState('');
  const [erroresPago, setErroresPago] = useState({});

  const handleMetodoPagoChange = (event) => {
    setMetodoPago(event.target.value);
    setErroresPago({});
    setEfectivoEntregado('')
    setPagoTransferencia('')
    setBancoSeleccionado('')
    setValorFormateadoEfectivo('')
    setValorFormateadoTransferencia('')
  };

  const handleBancoChange = (event) => {
    setBancoSeleccionado(event.target.value);
  };

  const handleEfectivoEntregadoChange = (event) => {
    // Eliminar puntos y comas para obtener el número real
    const valorSinFormato = event.target.value.replace(/\D/g, '');
    const numero = parseInt(valorSinFormato, 10);
    if (!isNaN(numero)) {
      // Actualizar el valor numérico real
      setEfectivoEntregado(numero);
      // Formatear el número para la visualización y actualizar el estado
      const formateador = new Intl.NumberFormat('es-ES');
      const valorConFormato = formateador.format(numero);
      setValorFormateadoEfectivo(valorConFormato);
    } else {
      // Manejar el caso de que el input esté vacío o sea inválido
      setValorFormateadoEfectivo('');
      setEfectivoEntregado('');
    }
  };

  const handlePagoTransferenciaChange = (event) => {
    // Eliminar puntos y comas para obtener el número real
    const valorSinFormato = event.target.value.replace(/\D/g, '');
    const numero = parseInt(valorSinFormato, 10);
    if (!isNaN(numero)) {
      // Actualizar el valor numérico real
      setPagoTransferencia(numero);
      // Formatear el número para la visualización y actualizar el estado
      const formateador = new Intl.NumberFormat('es-ES');
      const valorConFormato = formateador.format(numero);
      setValorFormateadoTransferencia(valorConFormato);
    } else {
      // Manejar el caso de que el input esté vacío o sea inválido
      setValorFormateadoTransferencia('');
      setPagoTransferencia('');
    }
  };

  const handlePago = () => {
    const fechaVenta = new Date();

    const nuevosErrores = {};
  
    if (metodoPago === 'efectivo') {
      if (efectivoEntregado === 0 || efectivoEntregado === '' || efectivoEntregado < totalFactura) {
        nuevosErrores.pagoEfectivo = 'El valor debe ser igual o mayor al total de la factura';
      }
    } 
    
    if (metodoPago === 'transferencia') {
      if (bancoSeleccionado === '') {
        nuevosErrores.banco = 'Seleccione un banco';
      }
    } 
    
    if (metodoPago === 'mixto') {
      if (bancoSeleccionado === '') {
        nuevosErrores.banco = 'Seleccione un banco';
      } 
      if (efectivoEntregado === 0 || efectivoEntregado === '') {
        nuevosErrores.pagoEfectivo = 'El valor debe ser mayor a 0';
      } 
      if (pagoTransferencia === 0 || pagoTransferencia === '') {
        nuevosErrores.pagoTransferencia = 'El valor debe ser mayor a 0';
      }
      if (((pagoTransferencia + efectivoEntregado) - totalFactura) < 0 ) {
        nuevosErrores.pagoEfectivo = 'La suma de ambos metodos de pago no supera el valor total';
      }
    }
  
    // Verifica si hay errores en la validación
    if (nuevosErrores.pagoEfectivo || nuevosErrores.pagoTransferencia || nuevosErrores.banco) {
      setErroresPago(nuevosErrores);
      return;
    } else {

      let infoFactura = {
        ...ventaResumen,
        metodoPago,
        totalFactura,
        fechaVenta: fechaVenta.toISOString(),
        vendedor: userName}

      if (metodoPago === "efectivo"){
        infoFactura = {
          ...infoFactura,
          pagoEfectivo: efectivoEntregado - devuelta,
          pagoTransferencia: 0,
          banco: "NoAplica",
        }
      } else if (metodoPago === "transferencia") {
        infoFactura = {
          ...infoFactura,
          pagoEfectivo: 0,
          pagoTransferencia: totalFactura,
          banco: bancoSeleccionado,
        }
      } else if (metodoPago === "mixto") {
        infoFactura = {
          ...infoFactura,
          pagoEfectivo: efectivoEntregado - Math.max(0, efectivoEntregado + pagoTransferencia - totalFactura),
          pagoTransferencia,
          banco: bancoSeleccionado,
        }
      }
      
      procesarPago(infoFactura);
      setEfectivoEntregado('');
      setValorFormateadoEfectivo('');
      setValorFormateadoTransferencia('');   
      setBancoSeleccionado('');
      setPagoTransferencia('');
      setDevuelta(0);
      setErroresPago({});
      onClose();
    }
  };

  const handleClose = () => {
    setEfectivoEntregado('');
    setValorFormateadoEfectivo('');
    setValorFormateadoTransferencia(''); 
    setBancoSeleccionado('');
    setPagoTransferencia('');
    setDevuelta(0);
    setErroresPago({});
    onClose(); 
  };
  

  const StyledButton = styled(Button)(({ theme }) => ({
    fontWeight: 'bold',
    textTransform: 'none',
    fontSize: '1rem',
    padding: theme.spacing(1, 2),
    margin: theme.spacing(1), 
  }));

  useEffect(() => {
    // Calcular la devuelta cada vez que se actualiza el efectivo entregado o el total de la factura
    if (efectivoEntregado > totalFactura) {
      setDevuelta(efectivoEntregado - totalFactura);
    } else {
      setDevuelta(0);
    }
  }, [efectivoEntregado, totalFactura]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Procesar Pago</DialogTitle>
      <DialogContent>
      <Accordion sx={{ marginBottom: 2, boxShadow: 4, borderRadius: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Resumen de la Venta</Typography>
        </AccordionSummary>
        <AccordionDetails style={{ maxHeight: '200px', overflowY: 'auto' }}>
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
            Datos del Cliente
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body1">Nombre: {ventaResumen.cliente.nombre}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1">Documento: {ventaResumen.cliente.docIdentidad}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1">Teléfono: {ventaResumen.cliente.telefono}</Typography>
            </Grid>
          </Grid>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Detalle de Productos</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Precio Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventaResumen.productosVendidos.map((producto, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {producto.nombre}
                      </TableCell>
                      <TableCell align="right">
                        {producto.cantidad}
                      </TableCell>
                      <TableCell align="right">
                        {producto.precio_unitario_venta.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                      </TableCell>
                      <TableCell align="right">
                        {(producto.precio_unitario_venta * producto.cantidad).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </AccordionDetails>
      </Accordion>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ width: '50%', display: 'inline-flex', boxShadow: 4, borderRadius: 2, padding: 2, backgroundColor: 'background.paper', marginY: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginRight: 1 }}>
              Total a Pagar:
            </Typography>
            <Typography sx={{ fontSize: '1.2rem', alignSelf: 'center' }}>
              {totalFactura.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            </Typography>
          </Box>
          
          <Box sx={{ width: '50%' }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="metodo-pago-label">Método de Pago</InputLabel>
              <Select
                labelId="metodo-pago-label"
                id="metodo-pago"
                value={metodoPago}
                label="Método de Pago"
                onChange={handleMetodoPagoChange}
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="mixto">Mixto</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {metodoPago === 'efectivo' && (
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box sx={{ 
              width: '50%',
              display: 'inline-flex', 
              boxShadow: 4, 
              borderRadius: 2, 
              padding: 2, 
              backgroundColor: 'background.paper',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginRight: 1  }}>
                Devuelta:
              </Typography>
              <Typography sx={{ fontSize: '1rem', alignSelf: 'center' }}>
                {devuelta.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </Typography>
            </Box>
            <Box sx={{ width: '50%' }}>
              <TextField
                label="Pago en Efectivo"
                type="text"
                fullWidth
                margin="normal"
                value={valorFormateadoEfectivo}
                onChange={handleEfectivoEntregadoChange}
                error={!!erroresPago.pagoEfectivo}
                helperText={erroresPago.pagoEfectivo} 
              />
            </Box>
          </Stack>
        )}

        {metodoPago === 'transferencia' && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="banco-label">Banco</InputLabel>
              <Select
                labelId="banco-label"
                id="banco"
                value={bancoSeleccionado}
                label="Banco"
                onChange={handleBancoChange}
                error={!!erroresPago.banco}
                >
                <MenuItem value="nequi">Nequi</MenuItem>
                <MenuItem value="bancolombia">Bancolombia</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {metodoPago === 'mixto' && (
          <Stack direction="row" spacing={2}>
            {/* Columna para el pago en efectivo */}
            <Box flex={1}>
              <Box sx={{ 
                width: '100%',
                display: 'inline-flex', 
                marginTop: 2,
                boxShadow: 4, 
                borderRadius: 2, 
                padding: 2, 
                backgroundColor: 'background.paper',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginRight: 1  }}>
                  Restante por Pagar:
                </Typography>
                <Typography sx={{ fontSize: '1rem', alignSelf: 'center' }}>
                  {Math.max(0, totalFactura - (efectivoEntregado + pagoTransferencia)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                </Typography>
              </Box>
              <Box sx={{ 
                width: '100%',
                marginTop: 2,
                display: 'inline-flex', 
                boxShadow: 4, 
                borderRadius: 2, 
                padding: 2, 
                backgroundColor: 'background.paper',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginRight: 1  }}>
                  Devuelta:
                </Typography>
                <Typography sx={{ fontSize: '1rem', alignSelf: 'center' }}>
                  {Math.max(0, efectivoEntregado + pagoTransferencia - totalFactura).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                </Typography>
              </Box>
            </Box>

            {/* Columna para el pago por transferencia */}
            <Box flex={1}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="banco-label">Banco</InputLabel>
                <Select
                  labelId="banco-label"
                  id="banco"
                  value={bancoSeleccionado}
                  label="Banco"
                  onChange={handleBancoChange}
                  error={!!erroresPago.banco}
                >
                  <MenuItem value="nequi">Nequi</MenuItem>
                  <MenuItem value="bancolombia">Bancolombia</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Pago por Transferencia"
                type="text"
                fullWidth
                margin="normal"
                value={valorFormateadoTransferencia}
                onChange={handlePagoTransferenciaChange}
                error={!!erroresPago.pagoTransferencia}
                helperText={erroresPago.pagoTransferencia}
              />
              <TextField
                label="Pago en Efectivo"
                type="text"
                fullWidth
                margin="normal"
                value={valorFormateadoEfectivo}
                onChange={handleEfectivoEntregadoChange}
                error={!!erroresPago.pagoEfectivo}
                helperText={erroresPago.pagoEfectivo}
              />
            </Box>
          </Stack>
        )}

      </DialogContent>
      <DialogActions>
        <StyledButton 
          onClick={handleClose} 
          sx={{ 
            backgroundColor: 'error.main',
            '&:hover': {
              backgroundColor: 'error.dark', 
            }
          }}
        >
          Cancelar
        </StyledButton>
        <StyledButton 
          onClick={handlePago} 
          variant="contained" 
          sx={{ 
            backgroundColor: 'success.light',
            '&:hover': {
              backgroundColor: 'success.main', 
            }
          }}
        >
          Procesar Pago
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
