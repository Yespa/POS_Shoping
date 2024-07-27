import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, TextField } from '@mui/material'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { green } from '@mui/material/colors';

const HandlerTipos = ({ open, onClose, nameTipo, idTipo }) => {
  const API_URL = process.env.REACT_APP_API_URL
  const [item, setItem] = useState(null);
  const [nuevoTipo, setNuevoTipo] = useState('');

  const obtenerDatos = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/tipos/${idTipo}`);
      const data = await respuesta.json();
      setItem(data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  }, [idTipo, API_URL]);

  const handleEliminarTipo = async (index) => {
    console.log(index)
    const tiposActualizados = [...item.tipos]
    tiposActualizados.splice(index, 1);
    console.log(tiposActualizados)

    try {
        const response = await fetch(`${API_URL}/tipos/${idTipo}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipos: tiposActualizados }),
        });

        if (response.ok) {
        obtenerDatos();
        }
    } catch (error) {
        console.error('Error al actualizar tipos:', error);
    }
    setNuevoTipo('');
  };

  const handleAgregarNuevoTipo = async () => {
    if (nuevoTipo) {
      const tiposActualizados = [...item.tipos, nuevoTipo];
  
      try {
        const response = await fetch(`${API_URL}/tipos/${idTipo}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tipos: tiposActualizados }),
        });
  
        if (response.ok) {
          obtenerDatos();
        }
      } catch (error) {
        console.error('Error al actualizar tipos:', error);
      }
  
      setNuevoTipo('');
    }
  };

  useEffect(() => {
    if (open) {
      obtenerDatos();
    }
  }, [open, obtenerDatos]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Tipos de {nameTipo}</DialogTitle>
      <DialogContent>
      <TableContainer component={Paper} style={{ maxHeight: '400px' }}>
        <Table>
            <TableHead>
                <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000' }}>Tipos</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000' }}>Acciones</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {item?.tipos.map((tipo, index) => (
                <TableRow key={index}>
                    <TableCell>{tipo}</TableCell>
                    <TableCell>
                    <IconButton onClick={() => handleEliminarTipo(index)}>
                        <DeleteIcon />
                    </IconButton>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
        </TableContainer>

        {/* Campo para agregar un nuevo tipo */}
        <TextField
          label="Agregar Nuevo Tipo"
          value={nuevoTipo}
          onChange={(e) => setNuevoTipo(e.target.value)}
          fullWidth
          style={{ marginTop: '20px' }} // Añade espacio en la parte superior
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">Cerrar</Button>
        <Button onClick={handleAgregarNuevoTipo} variant="contained" sx={{ 
          backgroundColor: green[500],
          '&:hover': {
            backgroundColor: green[700],
          },
        }}>Agregar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HandlerTipos;
