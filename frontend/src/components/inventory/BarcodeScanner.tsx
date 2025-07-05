import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Alert,
  Paper
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CloseIcon from '@mui/icons-material/Close';
import { QrReader } from 'react-qr-reader';

interface BarcodeScannerProps {
  onScan: (data: string) => void;
  buttonLabel?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onScan, 
  buttonLabel = 'Barcode scannen' 
}) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result?.text) {
      console.log('QR-Code erkannt:', result.text);
      onScan(result.text);
      setOpen(false);
    }
  };

  const handleError = (err: any) => {
    console.error('QR-Code Scanner Fehler:', err);
    setError('Die Kamera konnte nicht aktiviert werden. Bitte überprüfen Sie die Berechtigungen und versuchen Sie es erneut.');
  };

  return (
    <>
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={() => setOpen(true)}
        startIcon={<QrCodeScannerIcon />}
      >
        {buttonLabel}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">QR-Code / Barcode scannen</Typography>
            <Button 
              color="inherit" 
              onClick={() => setOpen(false)}
              startIcon={<CloseIcon />}
            >
              Schließen
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          
          <Box 
            sx={{ 
              width: '100%', 
              p: 1, 
              border: '1px solid #eee',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <Typography variant="body2" color="textSecondary" mb={1}>
              Halten Sie einen QR-Code oder Barcode vor die Kamera
            </Typography>
            
            <QrReader
              onResult={handleScan}
              constraints={{ facingMode: 'environment' }}
              scanDelay={500}
              videoStyle={{ width: '100%' }}
              videoId="qr-reader-video"
              ViewFinder={() => (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '2px solid #4caf50',
                    borderRadius: '8px',
                    boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)',
                    zIndex: 10
                  }}
                />
              )}
            />
          </Box>
          
          <Typography variant="body2" color="textSecondary" mt={2} textAlign="center">
            Tipp: Achten Sie auf gute Beleuchtung und halten Sie die Kamera ruhig.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Abbrechen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BarcodeScanner; 