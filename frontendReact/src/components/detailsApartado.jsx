import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ApartadoDialog = ({ apartadoInfo, open, onSave, onClose }) => {
  const API_URL = process.env.REACT_APP_API_URL
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [bancoSeleccionado, setBancoSeleccionado] = useState('');
  const [abonoTransferencia, setAbonoTransferencia] = useState('');
  const [abonoTransferenciaFormateado, setAbonoTransferenciaFormateado] = useState('');
  const [abonoEfectivo, setAbonoEfectivo] = useState('');
  const [abonoEfectivoFormateado, setAbonoEfectivoFormateado] = useState('');
  const [pendientePago, setPendientePago] = useState('');
  const [erroresPago, setErroresPago] = useState({});

  if (!apartadoInfo) return null;

  const handleMetodoPagoChange = (event) => {
    setMetodoPago(event.target.value);
    setBancoSeleccionado('');
    setAbonoTransferencia('');
    setAbonoEfectivoFormateado('');
    setAbonoTransferenciaFormateado('');
    setAbonoEfectivo('');
    setPendientePago(apartadoInfo.saldoPendiente);
    setErroresPago({});
  };

  const resetForm = () => {
    setBancoSeleccionado('');
    setAbonoTransferencia('');
    setAbonoEfectivoFormateado('');
    setAbonoTransferenciaFormateado('');
    setAbonoEfectivo('');
    setErroresPago({});
  };

  const handleBancoChange = (event) => {
    setBancoSeleccionado(event.target.value);
  };

  const handleAbonoEfectivoChange = (event) => {
    const valorSinFormato = event.target.value.replace(/\D/g, ''); // Elimina caracteres no numéricos
    const numero = valorSinFormato ? parseInt(valorSinFormato, 10) : 0;
    setAbonoEfectivo(numero); // Actualiza el valor numérico
    const formateador = new Intl.NumberFormat('es-ES');
    setAbonoEfectivoFormateado(formateador.format(numero)); // Actualiza el valor formateado
    actualizarPendientePago(numero, abonoTransferencia);
  };
  
  const handleAbonoTransferenciaChange = (event) => {
    const valorSinFormato = event.target.value.replace(/\D/g, ''); // Elimina caracteres no numéricos
    const numero = valorSinFormato ? parseInt(valorSinFormato, 10) : 0;
    setAbonoTransferencia(numero); // Actualiza el valor numérico
    const formateador = new Intl.NumberFormat('es-ES');
    setAbonoTransferenciaFormateado(formateador.format(numero)); // Actualiza el valor formateado
    actualizarPendientePago(abonoEfectivo, numero);
  };
  
  const actualizarPendientePago = (nuevoAbonoEfectivo, nuevoAbonoTransferencia) => {
    const nuevoTotalAbonado = nuevoAbonoEfectivo + nuevoAbonoTransferencia;
    const nuevoSaldoPendiente = apartadoInfo.saldoPendiente - nuevoTotalAbonado;
    setPendientePago(nuevoSaldoPendiente);
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  };

  const procesarPago = async (datosPago) => {
    console.log("Datos de Pago:", datosPago);
    try {
      const response = await fetch(`${API_URL}/facturas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosPago)
      });

      if (!response.ok) {
        throw new Error('Error al agregar el producto');
      }

      console.log('Venta registrada');

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAbono = () => {
    const nuevosErrores = {};
  
    if (metodoPago === 'efectivo') {
      if (abonoEfectivo === 0 || abonoEfectivo === '') {
        nuevosErrores.abonoEfectivo = 'El valor debe ser mayor a 0';
      }
      if (abonoEfectivo > apartadoInfo.saldoPendiente) {
        nuevosErrores.abonoEfectivo = 'Se está abonando más de lo necesario';
      }
    } 
    
    if (metodoPago === 'transferencia') {
      if (bancoSeleccionado === '') {
        nuevosErrores.banco = 'Seleccione un banco';
      }
      if (abonoTransferencia === 0 || abonoTransferencia === '') {
        nuevosErrores.abonoTransferencia = 'El valor debe ser mayor a 0';
      }
      if (abonoTransferencia > apartadoInfo.saldoPendiente) {
        nuevosErrores.abonoTransferencia = 'Se está abonando más de lo necesario';
      }
    } 
    
    if (metodoPago === 'mixto') {
      if (bancoSeleccionado === '') {
        nuevosErrores.banco = 'Seleccione un banco';
      }
      if (abonoEfectivo === 0 || abonoEfectivo === '') {
        nuevosErrores.abonoEfectivo = 'El valor debe ser mayor a 0';
      }
      if (abonoTransferencia === 0 || abonoTransferencia === '') {
        nuevosErrores.abonoTransferencia = 'El valor debe ser mayor a 0';
      }
      if (abonoEfectivo > apartadoInfo.saldoPendiente || abonoTransferencia > apartadoInfo.saldoPendiente || (abonoTransferencia + abonoEfectivo) > apartadoInfo.saldoPendiente) {
        nuevosErrores.abonoEfectivo = 'Se está abonando más de lo necesario';
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresPago(nuevosErrores);
      return;
    } else {

      let nuevoApartadoInfo = {}

      if (metodoPago === "efectivo"){
        nuevoApartadoInfo = {
          ...apartadoInfo,
          pagoTransferencia: 0 + apartadoInfo.pagoTransferencia,
          pagoEfectivo: abonoEfectivo + apartadoInfo.pagoEfectivo,
          banco: 'NoAplica'
        };
      } else if (metodoPago === "transferencia") {
        nuevoApartadoInfo = {
          ...apartadoInfo,
          pagoTransferencia: abonoTransferencia + apartadoInfo.pagoTransferencia,
          pagoEfectivo: 0 + apartadoInfo.pagoEfectivo,
          banco: bancoSeleccionado
        };
      } else if (metodoPago === "mixto") {
        nuevoApartadoInfo = {
          ...apartadoInfo,
          pagoTransferencia: abonoTransferencia + apartadoInfo.pagoTransferencia,
          pagoEfectivo: abonoEfectivo + apartadoInfo.pagoEfectivo,
          banco: bancoSeleccionado
        };
      }

      nuevoApartadoInfo.totalAbonado = nuevoApartadoInfo.pagoTransferencia + nuevoApartadoInfo.pagoEfectivo;
      nuevoApartadoInfo.saldoPendiente = nuevoApartadoInfo.totalFactura - nuevoApartadoInfo.totalAbonado;

      if (apartadoInfo.metodoPago === "efectivo" || apartadoInfo.metodoPago === "transferencia") {
        if (apartadoInfo.metodoPago !== metodoPago) {
          nuevoApartadoInfo.metodoPago = "mixto"
        }
      }

      nuevoApartadoInfo.historialAbonos = [
        ...nuevoApartadoInfo.historialAbonos,
        {
          fechaAbono: new Date().toISOString(),
          abono: (abonoEfectivo || 0) + (abonoTransferencia || 0),
        }
      ];

      let infoFactura = {
        cliente: nuevoApartadoInfo.cliente,
        productosVendidos: nuevoApartadoInfo.productosVendidos,
        pagoEfectivo: nuevoApartadoInfo.pagoEfectivo,
        pagoTransferencia: nuevoApartadoInfo.pagoTransferencia,
        banco: nuevoApartadoInfo.banco,
        metodoPago: nuevoApartadoInfo.metodoPago,
        totalFactura: nuevoApartadoInfo.totalFactura,
        fechaVenta: new Date().toISOString(),
        vendedor: nuevoApartadoInfo.vendedor
      }

      if (nuevoApartadoInfo.saldoPendiente === 0){
        console.log("registro apartado como venta")
        nuevoApartadoInfo.estado = "PAGADO"
        procesarPago(infoFactura)
      }


      onSave(nuevoApartadoInfo)
      resetForm();
      onClose()
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const StyledButton = styled(Button)(({ theme }) => ({
    fontWeight: 'bold',
    textTransform: 'none',
    fontSize: '1rem',
    padding: theme.spacing(1, 2),
    margin: theme.spacing(1), 
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Detalle de Apartado</DialogTitle>
      <DialogContent>
        <Box mb={2} display="flex" justifyContent="space-between">
            <Typography variant="body1">
                Fecha: {new Date(apartadoInfo.fechaApartado).toLocaleString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                })}
            </Typography>
          <Typography variant="body1">ID Apartado: {apartadoInfo._id}</Typography>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Datos del Cliente</Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Nombre:</span> {apartadoInfo.cliente.nombre}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Documento:</span> {apartadoInfo.cliente.docIdentidad}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Telefono:</span> {apartadoInfo.cliente.telefono}</Typography>
          </Grid>
        </Grid>

        <Accordion sx={{ marginBottom: 2, boxShadow: 4, borderRadius: 3, mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Resumen</Typography>
          </AccordionSummary>
          <AccordionDetails style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <Box>     
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, mb: 2 }}>Productos</Typography>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio Unitario</TableCell>
                      <TableCell align="right">Precio Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apartadoInfo.productosVendidos.map((producto) => (
                      <TableRow key={producto._id}>
                        <TableCell>{producto.nombre}</TableCell>
                        <TableCell align="right">{producto.cantidad}</TableCell>
                        <TableCell align="right">{formatCurrency(producto.precio_unitario_venta)}</TableCell>
                        <TableCell align="right">{formatCurrency(producto.precio_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Historial de Abonos</Typography>

              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha Abono</TableCell>
                      <TableCell align="right">Cantidad abonada</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apartadoInfo.historialAbonos.map((abono) => (
                      <TableRow key={abono._id}>
                        <TableCell>{new Date(abono.fechaAbono).toLocaleString('es-CO', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                        })}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(abono.abono)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Info total Abono</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Pago Transferencia:</span> {formatCurrency(apartadoInfo.pagoTransferencia)}</Typography>
                  <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Banco:</span> {apartadoInfo.banco}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Método de Pago:</span> {apartadoInfo.metodoPago}</Typography>
                  <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Pago Efectivo:</span> {formatCurrency(apartadoInfo.pagoEfectivo)}</Typography>
                </Grid>
              </Grid>

            </Box>
          </AccordionDetails>
        </Accordion>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Saldos a la fecha:</Typography>
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={6}>
            <Box sx={{ 
              width: '100%',
              display: 'flex', 
              boxShadow: 4, 
              borderRadius: 2, 
              padding: 2, 
              backgroundColor: '#F53F3F',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Saldo Pendiente:
              </Typography>
              <Typography sx={{ fontSize: '1rem', alignSelf: 'center' }}>
                {formatCurrency(apartadoInfo.saldoPendiente)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ 
              width: '100%',
              display: 'flex', 
              boxShadow: 4, 
              borderRadius: 2, 
              padding: 2, 
              backgroundColor: '#7DCE5A',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total Abonado:
              </Typography>
              <Typography sx={{ fontSize: '1rem', alignSelf: 'center' }}>
                {formatCurrency(apartadoInfo.totalAbonado)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ 
          marginTop: 2,
          display: 'flex', 
          justifyContent: 'space-between',
          boxShadow: 4, 
          borderRadius: 2, 
          padding: 2, 
          backgroundColor: 'background.paper',
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              Total Factura: {formatCurrency(apartadoInfo.totalFactura)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ opacity: 0.8 }}>
              Vendedor: {apartadoInfo.vendedor}
            </Typography>
          </Box>
        </Box>

        <Accordion sx={{ marginBottom: 2, boxShadow: 4, borderRadius: 3, mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Registro de Abono</Typography>
          </AccordionSummary>
          <AccordionDetails>

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
                Restante por pagar:
              </Typography>
              <Typography sx={{ fontSize: '1rem', alignSelf: 'center' }}>
                {pendientePago.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
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
              <Box flex={1}>
                <TextField
                  label="Pago en efectivo"
                  type="text"
                  fullWidth
                  margin="normal"
                  value={abonoEfectivoFormateado}
                  onChange={handleAbonoEfectivoChange}
                  error={!!erroresPago.abonoEfectivo}
                  helperText={erroresPago.abonoEfectivo}
                />
              </Box>
            </Stack>
          )}

          {metodoPago === 'transferencia' && (
            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                {/* Selector de banco */}
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

                {/* Campo de pago por transferencia */}
                <TextField
                  label="Pago por Transferencia"
                  type="text"
                  fullWidth
                  margin="normal"
                  value={abonoTransferenciaFormateado}
                  onChange={handleAbonoTransferenciaChange}
                  error={!!erroresPago.abonoTransferencia}
                  helperText={erroresPago.abonoTransferencia}
                />
              </Box>
            </Stack>
          )}

          {metodoPago === 'mixto' && (
            <Stack direction="row" spacing={2}>
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
                  value={abonoTransferenciaFormateado}
                  onChange={handleAbonoTransferenciaChange}
                  error={!!erroresPago.abonoTransferencia}
                  helperText={erroresPago.abonoTransferencia}
                />
                <TextField
                  label="Pago en Efectivo"
                  type="text"
                  fullWidth
                  margin="normal"
                  value={abonoEfectivoFormateado}
                  onChange={handleAbonoEfectivoChange}
                  error={!!erroresPago.abonoEfectivo}
                  helperText={erroresPago.abonoEfectivo}
                />
              </Box>
            </Stack>
          )}

          </AccordionDetails>
        </Accordion>
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
          onClick={handleAbono} 
          variant="contained" 
          sx={{ 
            backgroundColor: 'success.light',
            '&:hover': {
              backgroundColor: 'success.main', 
            }
          }}
        >
          Abonar
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default ApartadoDialog;
