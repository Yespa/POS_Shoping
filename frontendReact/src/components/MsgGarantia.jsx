import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

const MensajeGarantia = ({ open, onClose, onSave, onSkip }) => {
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (open) {
      setMensaje(''); // Restablece el valor del mensaje al abrir el diálogo
    }
  }, [open]);

  const handleSave = () => {
    onSave(mensaje);
    onClose();
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleSkip} 
      maxWidth="md" 
      fullWidth
      sx={{ '& .MuiDialog-paper': { minWidth: '500px' } }}
    >
      <DialogTitle>Garantía</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Ingresa la garantía para los productos"
          type="text"
          fullWidth
          variant="outlined"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          size="large"
          startIcon={<CancelIcon />}
          onClick={handleSkip}
          sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' }, fontSize: '1rem' }}
        >
          Omitir
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' }, fontSize: '1rem' }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MensajeGarantia;
