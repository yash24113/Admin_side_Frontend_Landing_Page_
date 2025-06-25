import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConfirmDialog = ({ open, title, content, onClose, onConfirm }) => (
  <Dialog open={open} onClose={() => onClose(false)}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{content}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => onClose(false)}>Cancel</Button>
      <Button onClick={onConfirm} color="primary" variant="contained">Confirm</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog; 