import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Paper
} from '@mui/material';

const FacturaDialog = ({ facturaInfo, open, handleClose }) => {
  if (!facturaInfo) return null;

  const formatCurrency = (amount) => {
    return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Detalle de Factura</DialogTitle>
      <DialogContent>
        <Box mb={2} display="flex" justifyContent="space-between">
            <Typography variant="body1">
                Fecha: {new Date(facturaInfo.fechaVenta).toLocaleString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                })}
            </Typography>
          <Typography variant="body1">ID Factura: {facturaInfo._id}</Typography>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Datos del Cliente</Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Nombre:</span> {facturaInfo.cliente.nombre}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Documento:</span> {facturaInfo.cliente.docIdentidad}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Telefono:</span> {facturaInfo.cliente.telefono}</Typography>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Detalle de Productos</Typography>
        <Paper style={{ maxHeight: 200, overflow: 'auto' }}>
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
                {facturaInfo.productosVendidos.map((producto) => (
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
        </Paper>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Detalle de Pago</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Pago Transferencia:</span> {formatCurrency(facturaInfo.pagoTransferencia)}</Typography>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Banco:</span> {facturaInfo.banco}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Método de Pago:</span> {facturaInfo.metodoPago}</Typography>
            <Typography variant="body1"><span style={{ fontWeight: 'bold' }}>Pago Efectivo:</span> {formatCurrency(facturaInfo.pagoEfectivo)}</Typography>
          </Grid>
        </Grid>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Total Factura: {formatCurrency(facturaInfo.totalFactura)}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8 }}>
            Vendedor: {facturaInfo.vendedor}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FacturaDialog;
