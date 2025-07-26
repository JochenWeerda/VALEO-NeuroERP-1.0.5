import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Typography,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { ContactPerson } from '../../../types/crm';

interface ContactListProps {
  contacts: ContactPerson[];
  onEdit: (contact: ContactPerson) => void;
  onDelete: (contactId: string) => void;
  isLoading?: boolean;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'Geschäftsführer': '#1976d2',
      'Einkauf': '#388e3c',
      'Technik': '#f57c00',
      'Vertrieb': '#7b1fa2',
      'Buchhaltung': '#d32f2f',
      'default': '#757575'
    };
    return colors[position] || colors.default;
  };

  const getContactIcon = (contact: ContactPerson) => {
    if (contact.isMainContact) {
      return <PersonIcon sx={{ color: '#1976d2' }} />;
    }
    return <PersonIcon />;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>Lade Kontakte...</Typography>
      </Box>
    );
  }

  if (contacts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography variant="body2" color="textSecondary">
          Keine Kontakte gefunden
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Kontakt</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Telefon</TableCell>
            <TableCell>E-Mail</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Rolle</TableCell>
            <TableCell align="center">Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {getContactIcon(contact)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {contact.salutation} {contact.firstName} {contact.lastName}
                    </Typography>
                    {contact.department && (
                      <Typography variant="caption" color="textSecondary">
                        {contact.department}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={contact.position}
                  size="small"
                  sx={{
                    backgroundColor: getPositionColor(contact.position),
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {contact.phone1 && (
                    <Tooltip title={contact.phone1}>
                      <PhoneIcon fontSize="small" color="primary" />
                    </Tooltip>
                  )}
                  {contact.mobile && (
                    <Tooltip title={contact.mobile}>
                      <PhoneIcon fontSize="small" color="secondary" />
                    </Tooltip>
                  )}
                  {contact.whatsapp && (
                    <Tooltip title={contact.whatsapp}>
                      <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                {contact.email && (
                  <Tooltip title={contact.email}>
                    <EmailIcon fontSize="small" color="primary" />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={contact.isActive ? 'Aktiv' : 'Inaktiv'}
                  size="small"
                  color={contact.isActive ? 'success' : 'default'}
                />
                {contact.isMainContact && (
                  <Chip
                    label="Hauptkontakt"
                    size="small"
                    color="primary"
                    sx={{ ml: 0.5 }}
                  />
                )}
              </TableCell>
              <TableCell>
                <Typography variant="caption">
                  {contact.role}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Bearbeiten">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(contact)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(contact.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 