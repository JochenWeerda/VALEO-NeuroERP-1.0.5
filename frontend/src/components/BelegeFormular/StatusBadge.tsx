import React from 'react';
import { Chip, Box, Typography } from '@mui/material';

type StatusDefinition = {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  textColor?: string;
  icon?: React.ReactNode;
};

type StatusMap = {
  [key: string]: StatusDefinition;
};

// Angebotsstatus
const angebotStatusMap: StatusMap = {
  entwurf: { label: 'Entwurf', color: 'default' },
  gesendet: { label: 'Gesendet', color: 'info' },
  akzeptiert: { label: 'Akzeptiert', color: 'success' },
  abgelehnt: { label: 'Abgelehnt', color: 'error' },
  abgelaufen: { label: 'Abgelaufen', color: 'warning' }
};

// Auftragsstatus
const auftragStatusMap: StatusMap = {
  entwurf: { label: 'Entwurf', color: 'default' },
  bestaetigt: { label: 'Bestätigt', color: 'primary' },
  in_bearbeitung: { label: 'In Bearbeitung', color: 'info' },
  teilweise_geliefert: { label: 'Teilweise geliefert', color: 'warning' },
  geliefert: { label: 'Geliefert', color: 'success' },
  abgeschlossen: { label: 'Abgeschlossen', color: 'success' },
  storniert: { label: 'Storniert', color: 'error' }
};

// Lieferscheinstatus
const lieferscheinStatusMap: StatusMap = {
  entwurf: { label: 'Entwurf', color: 'default' },
  verpackt: { label: 'Verpackt', color: 'info' },
  versandt: { label: 'Versandt', color: 'warning' },
  zugestellt: { label: 'Zugestellt', color: 'success' },
  storniert: { label: 'Storniert', color: 'error' }
};

// Rechnungsstatus
const rechnungStatusMap: StatusMap = {
  entwurf: { label: 'Entwurf', color: 'default' },
  gesendet: { label: 'Gesendet', color: 'info' },
  teilweise_bezahlt: { label: 'Teilweise bezahlt', color: 'warning' },
  bezahlt: { label: 'Bezahlt', color: 'success' },
  überfällig: { label: 'Überfällig', color: 'error' },
  storniert: { label: 'Storniert', color: 'error' }
};

// Bestellungsstatus
const bestellungStatusMap: StatusMap = {
  entwurf: { label: 'Entwurf', color: 'default' },
  angefragt: { label: 'Angefragt', color: 'info' },
  bestaetigt: { label: 'Bestätigt', color: 'primary' },
  teilweise_geliefert: { label: 'Teilweise geliefert', color: 'warning' },
  geliefert: { label: 'Geliefert', color: 'success' },
  storniert: { label: 'Storniert', color: 'error' }
};

// Eingangslieferscheinstatus
const eingangslieferscheinStatusMap: StatusMap = {
  entwurf: { label: 'Entwurf', color: 'default' },
  erfasst: { label: 'Erfasst', color: 'info' },
  geprüft: { label: 'Geprüft', color: 'warning' },
  eingelagert: { label: 'Eingelagert', color: 'success' },
  zurückgewiesen: { label: 'Zurückgewiesen', color: 'error' }
};

// Mapping von Belegtyp zu Status-Map
const statusMaps: { [key: string]: StatusMap } = {
  angebot: angebotStatusMap,
  auftrag: auftragStatusMap,
  lieferschein: lieferscheinStatusMap,
  rechnung: rechnungStatusMap,
  bestellung: bestellungStatusMap,
  eingangslieferschein: eingangslieferscheinStatusMap
};

interface StatusBadgeProps {
  status: string;
  belegTyp: 'angebot' | 'auftrag' | 'lieferschein' | 'rechnung' | 'bestellung' | 'eingangslieferschein';
  showLabel?: boolean;
  size?: 'small' | 'medium';
  className?: string;
  style?: React.CSSProperties;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  belegTyp,
  showLabel = false,
  size = 'medium',
  className,
  style
}) => {
  const statusMap = statusMaps[belegTyp];
  
  if (!statusMap) {
    console.warn(`Unbekannter Belegtyp: ${belegTyp}`);
    return null;
  }

  const statusDefinition = statusMap[status] || { label: status, color: 'default' };

  return (
    <Box display="flex" alignItems="center" className={className} style={style}>
      {showLabel && (
        <Typography variant="body2" sx={{ mr: 1 }}>Status:</Typography>
      )}
      <Chip
        label={statusDefinition.label}
        color={statusDefinition.color}
        size={size}
        icon={statusDefinition.icon}
      />
    </Box>
  );
};

export default StatusBadge; 