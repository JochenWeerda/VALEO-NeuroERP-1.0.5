import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { Close } from '@mui/icons-material';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { UI_LABELS } from './ui/UIStandardization';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // ✅ REFAKTORIERT: Mapping der Größen zu Material-UI Dialog-Größen
  const getDialogMaxWidth = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'md':
        return 'md';
      case 'lg':
        return 'lg';
      case 'xl':
        return 'xl';
      default:
        return 'md';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={getDialogMaxWidth()}
      fullWidth
      className={className}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24
        }
      }}
    >
      {title && (
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h6" component="h3" fontWeight="semibold">
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' }
            }}
            aria-label="Schließen"
          >
            <Close />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}; 