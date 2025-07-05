import React from 'react';
import {
  Paper,
  Button,
  ButtonGroup,
  Divider,
  Box,
  Tooltip,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PaymentIcon from '@mui/icons-material/Payment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

export type BelegAktion = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  handler: () => void;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
};

export interface BelegAktionenLeisteProps {
  aktionen: BelegAktion[];
  belegTyp: 'angebot' | 'auftrag' | 'lieferschein' | 'rechnung' | 'bestellung' | 'eingangslieferschein';
  position?: 'top' | 'bottom';
  alignment?: 'left' | 'right' | 'center' | 'space-between';
  loading?: boolean;
  groupButtons?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Standard-Aktionen nach Belegtyp
export const getStandardAktionen = (
  belegTyp: string,
  status: string,
  handlers: {
    onSave?: () => void;
    onSend?: () => void;
    onPrint?: () => void;
    onEmail?: () => void;
    onDelete?: () => void;
    onClose?: () => void;
    onAccept?: () => void;
    onReject?: () => void;
    onCancel?: () => void;
    onShip?: () => void;
    onInvoice?: () => void;
    onPay?: () => void;
    onDelivery?: () => void;
    onCreateOrder?: () => void;
    onDuplicate?: () => void;
    [key: string]: (() => void) | undefined;
  },
  disabled: boolean = false
): BelegAktion[] => {
  const aktionen: BelegAktion[] = [];

  // Gemeinsame Aktionen für alle Belegtypen
  if (handlers.onSave) {
    aktionen.push({
      id: 'save',
      label: 'Speichern',
      icon: <SaveIcon />,
      handler: handlers.onSave,
      disabled: disabled,
      color: 'primary',
      variant: 'contained',
      tooltip: 'Änderungen speichern'
    });
  }

  if (handlers.onPrint) {
    aktionen.push({
      id: 'print',
      label: 'Drucken',
      icon: <PrintIcon />,
      handler: handlers.onPrint,
      disabled: disabled,
      tooltip: 'Beleg drucken'
    });
  }

  if (handlers.onEmail) {
    aktionen.push({
      id: 'email',
      label: 'E-Mail',
      icon: <EmailIcon />,
      handler: handlers.onEmail,
      disabled: disabled,
      tooltip: 'Beleg per E-Mail senden'
    });
  }

  // Spezifische Aktionen je nach Belegtyp und Status
  switch (belegTyp) {
    case 'angebot':
      if (status === 'entwurf' && handlers.onSend) {
        aktionen.push({
          id: 'send',
          label: 'Versenden',
          icon: <EmailIcon />,
          handler: handlers.onSend,
          disabled: disabled,
          color: 'success',
          variant: 'contained',
          tooltip: 'Angebot an Kunden senden'
        });
      }

      if (status === 'gesendet') {
        if (handlers.onAccept) {
          aktionen.push({
            id: 'accept',
            label: 'Akzeptieren',
            icon: <CheckIcon />,
            handler: handlers.onAccept,
            disabled: disabled,
            color: 'success',
            tooltip: 'Angebot als akzeptiert markieren'
          });
        }
        if (handlers.onReject) {
          aktionen.push({
            id: 'reject',
            label: 'Ablehnen',
            icon: <CancelIcon />,
            handler: handlers.onReject,
            disabled: disabled,
            color: 'error',
            tooltip: 'Angebot als abgelehnt markieren'
          });
        }
        if (handlers.onCreateOrder) {
          aktionen.push({
            id: 'createOrder',
            label: 'Auftrag erstellen',
            icon: <AssignmentIcon />,
            handler: handlers.onCreateOrder,
            disabled: disabled,
            color: 'primary',
            variant: 'contained',
            tooltip: 'Auftrag aus diesem Angebot erstellen'
          });
        }
      }
      break;

    case 'auftrag':
      if (status === 'entwurf' && handlers.onSend) {
        aktionen.push({
          id: 'confirm',
          label: 'Bestätigen',
          icon: <CheckCircleIcon />,
          handler: handlers.onSend,
          disabled: disabled,
          color: 'success',
          variant: 'contained',
          tooltip: 'Auftrag bestätigen'
        });
      }

      if (['bestaetigt', 'in_bearbeitung'].includes(status) && handlers.onShip) {
        aktionen.push({
          id: 'ship',
          label: 'Lieferschein erstellen',
          icon: <LocalShippingIcon />,
          handler: handlers.onShip,
          disabled: disabled,
          color: 'primary',
          variant: 'contained',
          tooltip: 'Lieferschein aus diesem Auftrag erstellen'
        });
      }

      if (['geliefert', 'teilweise_geliefert'].includes(status) && handlers.onInvoice) {
        aktionen.push({
          id: 'invoice',
          label: 'Rechnung erstellen',
          icon: <ReceiptIcon />,
          handler: handlers.onInvoice,
          disabled: disabled,
          color: 'primary',
          variant: 'contained',
          tooltip: 'Rechnung aus diesem Auftrag erstellen'
        });
      }

      if (!['storniert', 'abgeschlossen'].includes(status) && handlers.onCancel) {
        aktionen.push({
          id: 'cancel',
          label: 'Stornieren',
          icon: <CancelIcon />,
          handler: handlers.onCancel,
          disabled: disabled,
          color: 'error',
          tooltip: 'Auftrag stornieren'
        });
      }
      break;

    case 'lieferschein':
      if (status === 'entwurf' && handlers.onSend) {
        aktionen.push({
          id: 'pack',
          label: 'Als verpackt markieren',
          icon: <CheckIcon />,
          handler: handlers.onSend,
          disabled: disabled,
          color: 'success',
          variant: 'contained',
          tooltip: 'Lieferschein als verpackt markieren'
        });
      }

      if (status === 'verpackt' && handlers.onShip) {
        aktionen.push({
          id: 'send',
          label: 'Versenden',
          icon: <FlightTakeoffIcon />,
          handler: handlers.onShip,
          disabled: disabled,
          color: 'primary',
          variant: 'contained',
          tooltip: 'Lieferschein als versendet markieren'
        });
      }

      if (status === 'versandt' && handlers.onDelivery) {
        aktionen.push({
          id: 'delivery',
          label: 'Zustellung bestätigen',
          icon: <CheckCircleIcon />,
          handler: handlers.onDelivery,
          disabled: disabled,
          color: 'success',
          tooltip: 'Lieferschein als zugestellt markieren'
        });
      }

      if (!['storniert', 'zugestellt'].includes(status) && handlers.onCancel) {
        aktionen.push({
          id: 'cancel',
          label: 'Stornieren',
          icon: <CancelIcon />,
          handler: handlers.onCancel,
          disabled: disabled,
          color: 'error',
          tooltip: 'Lieferschein stornieren'
        });
      }
      break;

    case 'rechnung':
      if (status === 'entwurf' && handlers.onSend) {
        aktionen.push({
          id: 'send',
          label: 'Versenden',
          icon: <EmailIcon />,
          handler: handlers.onSend,
          disabled: disabled,
          color: 'success',
          variant: 'contained',
          tooltip: 'Rechnung an Kunden senden'
        });
      }

      if (['gesendet', 'teilweise_bezahlt', 'überfällig'].includes(status) && handlers.onPay) {
        aktionen.push({
          id: 'pay',
          label: 'Zahlung erfassen',
          icon: <PaymentIcon />,
          handler: handlers.onPay,
          disabled: disabled,
          color: 'primary',
          variant: 'contained',
          tooltip: 'Zahlung für diese Rechnung erfassen'
        });
      }

      if (!['storniert', 'bezahlt'].includes(status) && handlers.onCancel) {
        aktionen.push({
          id: 'cancel',
          label: 'Stornieren',
          icon: <CancelIcon />,
          handler: handlers.onCancel,
          disabled: disabled,
          color: 'error',
          tooltip: 'Rechnung stornieren'
        });
      }
      break;

    case 'bestellung':
      if (status === 'entwurf' && handlers.onSend) {
        aktionen.push({
          id: 'send',
          label: 'Anfragen',
          icon: <EmailIcon />,
          handler: handlers.onSend,
          disabled: disabled,
          color: 'success',
          variant: 'contained',
          tooltip: 'Bestellung an Lieferanten senden'
        });
      }

      if (status === 'angefragt' && handlers.onAccept) {
        aktionen.push({
          id: 'confirm',
          label: 'Bestätigen',
          icon: <CheckCircleIcon />,
          handler: handlers.onAccept,
          disabled: disabled,
          color: 'success',
          tooltip: 'Bestellung als bestätigt markieren'
        });
      }

      if (['bestaetigt', 'teilweise_geliefert'].includes(status) && handlers.onDelivery) {
        aktionen.push({
          id: 'delivery',
          label: 'Wareneingang erfassen',
          icon: <LocalShippingIcon />,
          handler: handlers.onDelivery,
          disabled: disabled,
          color: 'primary',
          variant: 'contained',
          tooltip: 'Wareneingang für diese Bestellung erfassen'
        });
      }

      if (!['storniert', 'geliefert'].includes(status) && handlers.onCancel) {
        aktionen.push({
          id: 'cancel',
          label: 'Stornieren',
          icon: <CancelIcon />,
          handler: handlers.onCancel,
          disabled: disabled,
          color: 'error',
          tooltip: 'Bestellung stornieren'
        });
      }
      break;
      
    case 'eingangslieferschein':
      if (status === 'entwurf' && handlers.onSend) {
        aktionen.push({
          id: 'capture',
          label: 'Erfassen',
          icon: <AssignmentIcon />,
          handler: handlers.onSend,
          disabled: disabled,
          color: 'success',
          variant: 'contained',
          tooltip: 'Wareneingang erfassen'
        });
      }

      if (status === 'erfasst' && handlers.onAccept) {
        aktionen.push({
          id: 'check',
          label: 'Prüfen',
          icon: <CheckIcon />,
          handler: handlers.onAccept,
          disabled: disabled,
          color: 'primary',
          variant: 'contained',
          tooltip: 'Wareneingang prüfen'
        });
      }

      if (status === 'geprüft' && handlers.onDelivery) {
        aktionen.push({
          id: 'store',
          label: 'Einlagern',
          icon: <LocalShippingIcon />,
          handler: handlers.onDelivery,
          disabled: disabled,
          color: 'success',
          tooltip: 'Waren einlagern'
        });
      }

      if (!['zurückgewiesen', 'eingelagert'].includes(status) && handlers.onReject) {
        aktionen.push({
          id: 'reject',
          label: 'Zurückweisen',
          icon: <CancelIcon />,
          handler: handlers.onReject,
          disabled: disabled,
          color: 'error',
          tooltip: 'Wareneingang zurückweisen'
        });
      }
      break;
  }

  // Duplizieren, Löschen und Schließen für alle Belegtypen
  if (handlers.onDuplicate) {
    aktionen.push({
      id: 'duplicate',
      label: 'Duplizieren',
      icon: <FileCopyIcon />,
      handler: handlers.onDuplicate,
      disabled: disabled,
      tooltip: 'Beleg duplizieren'
    });
  }

  if (handlers.onDelete) {
    aktionen.push({
      id: 'delete',
      label: 'Löschen',
      icon: <DeleteIcon />,
      handler: handlers.onDelete,
      disabled: disabled || !['entwurf'].includes(status),
      color: 'error',
      tooltip: 'Beleg löschen'
    });
  }

  if (handlers.onClose) {
    aktionen.push({
      id: 'close',
      label: 'Schließen',
      icon: <CloseIcon />,
      handler: handlers.onClose,
      tooltip: 'Ohne Speichern schließen'
    });
  }

  return aktionen;
};

const BelegAktionenLeiste: React.FC<BelegAktionenLeisteProps> = ({
  aktionen,
  belegTyp,
  position = 'top',
  alignment = 'right',
  loading = false,
  groupButtons = false,
  className,
  style
}) => {
  if (loading) {
    return (
      <Paper 
        sx={{ 
          p: 1, 
          display: 'flex', 
          justifyContent: 'center',
          mb: position === 'top' ? 2 : 0,
          mt: position === 'bottom' ? 2 : 0
        }}
        className={className}
        style={style}
      >
        <CircularProgress size={24} />
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 1, 
        display: 'flex', 
        justifyContent: alignment,
        mb: position === 'top' ? 2 : 0,
        mt: position === 'bottom' ? 2 : 0
      }}
      className={className}
      style={style}
    >
      {groupButtons ? (
        <ButtonGroup variant="contained" size="small">
          {aktionen.map((aktion) => (
            <Tooltip key={aktion.id} title={aktion.tooltip || aktion.label}>
              <Button
                color={aktion.color || 'inherit'}
                variant={aktion.variant || 'outlined'}
                onClick={aktion.handler}
                disabled={aktion.disabled || loading}
                startIcon={aktion.icon}
              >
                {aktion.label}
                {aktion.loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
              </Button>
            </Tooltip>
          ))}
        </ButtonGroup>
      ) : (
        <Box>
          {aktionen.map((aktion, index) => (
            <React.Fragment key={aktion.id}>
              <Tooltip title={aktion.tooltip || aktion.label}>
                <Button
                  color={aktion.color || 'inherit'}
                  variant={aktion.variant || 'outlined'}
                  onClick={aktion.handler}
                  disabled={aktion.disabled || loading}
                  startIcon={aktion.icon}
                  sx={{ mx: 0.5 }}
                >
                  {aktion.label}
                  {aktion.loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Button>
              </Tooltip>
              {index < aktionen.length - 1 && alignment === 'space-between' && (
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              )}
            </React.Fragment>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default BelegAktionenLeiste; 