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
  Paper
} from '@mui/material';

const InventarioDialog = ({ InventarioInfo, open, handleClose }) => {
  if (!InventarioInfo) return null;

  const formatCurrency = (amount) => {
    return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0  });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Totales Inventario</DialogTitle>
      <DialogContent>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>Totales por Tipo de Producto</Typography>
        <Paper style={{ maxHeight: 200, overflow: 'auto' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo de Producto</TableCell>
                  <TableCell align="right">Total Precio Inventario</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {InventarioInfo.sumaPorTipoProducto.map((tipo) => (
                  <TableRow key={tipo._id}>
                    <TableCell>{tipo._id}</TableCell>
                    <TableCell align="right">{formatCurrency(tipo.sumaPrecioInventario)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ width: '50%', display: 'inline-flex', boxShadow: 4, borderRadius: 2, padding: 2, backgroundColor: 'background.paper', marginY: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginRight: 1 }}>
            Total Inventario:
          </Typography>
          <Typography sx={{ fontSize: '1.2rem', alignSelf: 'center' }}>
            {InventarioInfo.sumaTotalPrecioInventario.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
          </Typography>
        </Box>

      </DialogContent>
    </Dialog>
  );
};

export default InventarioDialog;
