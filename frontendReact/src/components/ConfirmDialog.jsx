import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const ConfirmDialog = ({ open, onClose, onConfirm, nameItem, item }) => {
  const valueItem = item?.nombre || item?._id;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar Borrado</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que quieres eliminar {nameItem} "{valueItem}"?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancelar</Button>
        <Button onClick={() => { onConfirm(item?._id); onClose(); }} color="secondary">Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
