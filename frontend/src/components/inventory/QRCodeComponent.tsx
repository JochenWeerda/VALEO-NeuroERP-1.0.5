import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import DownloadIcon from '@mui/icons-material/Download';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';

interface QRCodeComponentProps {
  chargeId: number;
  chargennummer: string;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ chargeId, chargennummer }) => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`/api/v1/charge/${chargeId}/generate-qrcode`);
      setQrCodeData(response.data.qr_code);
      setShowQRCodeDialog(true);
    } catch (err) {
      console.error('Fehler beim Generieren des QR-Codes:', err);
      setError('Der QR-Code konnte nicht generiert werden.');
    } finally {
      setLoading(false);
    }
  };

  const getQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/v1/charge/${chargeId}/qrcode`);
      setQrCodeData(response.data.qr_code);
      setShowQRCodeDialog(true);
    } catch (err) {
      // Wenn kein QR-Code vorhanden ist, generieren wir einen neuen
      console.log('Kein vorhandener QR-Code, generiere einen neuen');
      await generateQRCode();
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const qrCodeElement = document.getElementById('qr-code-container');
    if (qrCodeElement) {
      toPng(qrCodeElement)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `charge-${chargennummer}-qrcode.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Fehler beim Speichern des QR-Codes:', err);
          setError('Der QR-Code konnte nicht gespeichert werden.');
        });
    }
  };

  const printQRCode = () => {
    const qrCodeElement = document.getElementById('qr-code-container');
    if (qrCodeElement) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR-Code für Charge ${chargennummer}</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; }
                .container { margin: 20px; }
                .qr-code { margin: 20px auto; }
                .info { margin-top: 10px; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>QR-Code für Charge</h2>
                <div class="qr-code">
                  <img src="${qrCodeData}" width="300" height="300" />
                </div>
                <div class="info">
                  <p>Chargennummer: ${chargennummer}</p>
                  <p>Charge-ID: ${chargeId}</p>
                  <p>Datum: ${new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <>
      <Box display="flex" gap={2} mt={2}>
        <Tooltip title="QR-Code anzeigen oder generieren">
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={getQRCode}
            startIcon={<QrCodeIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'QR-Code'}
          </Button>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog 
        open={showQRCodeDialog} 
        onClose={() => setShowQRCodeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          QR-Code für Charge {chargennummer}
        </DialogTitle>
        <DialogContent>
          {qrCodeData ? (
            <Box 
              id="qr-code-container" 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              p={2}
            >
              <img 
                src={qrCodeData} 
                alt={`QR-Code für Charge ${chargennummer}`} 
                style={{ width: '100%', maxWidth: '300px' }} 
              />
              <Typography variant="body2" color="textSecondary" mt={2}>
                Charge: {chargennummer} (ID: {chargeId})
              </Typography>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowQRCodeDialog(false)} 
            color="primary"
          >
            Schließen
          </Button>
          <Button 
            onClick={downloadQRCode} 
            color="primary" 
            startIcon={<DownloadIcon />}
            disabled={!qrCodeData}
          >
            Speichern
          </Button>
          <Button 
            onClick={printQRCode} 
            color="primary" 
            startIcon={<PrintIcon />}
            disabled={!qrCodeData}
          >
            Drucken
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QRCodeComponent; 