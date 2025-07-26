import React, { useState } from 'react';
import {
  Card,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Table, Input, Space, Tag, DatePicker } from 'antd';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Print as PrintIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  Engineering as EngineeringIcon,
  LocalShipping as ShippingIcon,
  Folder as FolderIcon,
  Contacts as ContactsIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';

// TypeScript Interfaces
interface OrderConfirmationData {
  // Kopfbereich
  orderNumber: string;
  date: Date;
  customerNumber: string;
  debtorNumber: string;
  status: OrderStatus;
  phoneContact: string;
  creditLimit: number;
  branch: string;
  completed: boolean;
  
  // Navigationsbaum-Daten
  general: CustomerGeneralData;
  offerOrder: OfferOrderData;
  invoicePayment: InvoicePaymentData;
  technical: TechnicalData;
  deliveryPackaging: DeliveryPackagingData;
  documentData: DocumentData;
  contacts: ContactPerson[];
  representatives: Representative[];
  customerAssignment: CustomerAssignmentData;
}

type OrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface CustomerGeneralData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  vatNumber: string;
}

interface OfferOrderData {
  offerNumber: string;
  offerDate: Date;
  orderNumber: string;
  orderDate: Date;
  totalAmount: number;
  currency: string;
}

interface InvoicePaymentData {
  paymentMethod: string;
  paymentTerms: string;
  discountDays: number;
  discountPercent: number;
  bankAccount: string;
}

interface TechnicalData {
  technicalContact: string;
  specifications: string;
  requirements: string;
  notes: string;
}

interface DeliveryPackagingData {
  deliveryAddress: string;
  packagingInstructions: string;
  specialRequirements: string;
}

interface DocumentData {
  documents: Document[];
}

interface Document {
  id: string;
  type: string;
  name: string;
  date: Date;
  status: string;
}

interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  function: string;
}

interface Representative {
  id: string;
  name: string;
  phone: string;
  email: string;
  territory: string;
}

interface CustomerAssignmentData {
  salesRepresentative: string;
  territory: string;
  customerGroup: string;
  priority: string;
}

interface OrderConfirmationProps {
  mode: 'create' | 'edit' | 'view';
  initialData?: OrderConfirmationData;
  onSave: (confirmation: OrderConfirmationData) => void;
  onCancel: () => void;
}

// Validierungsschema
const confirmationSchema = yup.object({
  orderNumber: yup.string().required('Auftragsnummer ist erforderlich'),
  customerNumber: yup.string().required('Kundennummer ist erforderlich'),
  debtorNumber: yup.string().required('Debitoren-Nummer ist erforderlich'),
  phoneContact: yup.string().required('Telefonkontakt ist erforderlich'),
  branch: yup.string().required('Niederlassung ist erforderlich')
});

// Mock-Daten
const mockContacts: ContactPerson[] = [
  {
    id: '1',
    name: 'Max Mustermann',
    phone: '+49 123 456789',
    email: 'max.mustermann@example.com',
    function: 'Einkaufsleiter'
  },
  {
    id: '2',
    name: 'Anna Schmidt',
    phone: '+49 123 456790',
    email: 'anna.schmidt@example.com',
    function: 'Technischer Leiter'
  }
];

const mockRepresentatives: Representative[] = [
  {
    id: '1',
    name: 'Peter Müller',
    phone: '+49 987 654321',
    email: 'peter.mueller@company.com',
    territory: 'Deutschland Süd'
  }
];

const customers = ['Kunde A GmbH', 'Kunde B AG', 'Kunde C KG'];
const debtors = ['DEB-001', 'DEB-002', 'DEB-003'];
const branches = ['Hauptniederlassung', 'Niederlassung Nord', 'Niederlassung Süd'];
const statuses: OrderStatus[] = ['draft', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const paymentMethods = ['Überweisung', 'Lastschrift', 'Kreditkarte', 'Bar'];
const currencies = ['EUR', 'USD', 'CHF'];

// Navigationsbaum-Elemente
const navigationItems = [
  { id: 'general', label: 'Allgemein', icon: <BusinessIcon /> },
  { id: 'offerOrder', label: 'Angebot/Auftrag', icon: <DescriptionIcon /> },
  { id: 'invoicePayment', label: 'Rechnung/Zahlung', icon: <PaymentIcon /> },
  { id: 'technical', label: 'Technisch', icon: <EngineeringIcon /> },
  { id: 'deliveryPackaging', label: 'Lieferung/Verpackung', icon: <ShippingIcon /> },
  { id: 'documentData', label: 'Dokumente', icon: <FolderIcon /> },
  { id: 'contacts', label: 'Kontakte', icon: <ContactsIcon /> },
  { id: 'representatives', label: 'Vertreter', icon: <PeopleIcon /> },
  { id: 'customerAssignment', label: 'Kunden-Zuordnung', icon: <AssignmentIcon /> }
];

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  mode,
  initialData,
  onSave,
  onCancel
}) => {
  const [activeSection, setActiveSection] = useState('general');
  const [contacts, setContacts] = useState<ContactPerson[]>(
    initialData?.contacts || mockContacts
  );
  const [representatives, setRepresentatives] = useState<Representative[]>(
    initialData?.representatives || mockRepresentatives
  );
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editingRepresentative, setEditingRepresentative] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<OrderConfirmationData>({
    resolver: yupResolver(confirmationSchema),
    defaultValues: initialData || {
      date: new Date(),
      status: 'draft',
      completed: false,
      general: {
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        taxNumber: '',
        vatNumber: ''
      },
      offerOrder: {
        offerNumber: '',
        offerDate: new Date(),
        orderNumber: '',
        orderDate: new Date(),
        totalAmount: 0,
        currency: 'EUR'
      },
      invoicePayment: {
        paymentMethod: 'Überweisung',
        paymentTerms: '30 Tage netto',
        discountDays: 14,
        discountPercent: 2,
        bankAccount: ''
      },
      technical: {
        technicalContact: '',
        specifications: '',
        requirements: '',
        notes: ''
      },
      deliveryPackaging: {
        deliveryAddress: '',
        packagingInstructions: '',
        specialRequirements: ''
      },
      documentData: {
        documents: []
      },
      contacts: mockContacts,
      representatives: mockRepresentatives,
      customerAssignment: {
        salesRepresentative: '',
        territory: '',
        customerGroup: '',
        priority: 'normal'
      }
    }
  });

  const watchedData = watch();

  // Ant Design Table Spalten für Kontakte
  const contactColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ContactPerson) => (
        editingContact === record.id ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newContacts = contacts.map(c => 
                c.id === record.id 
                  ? { ...c, name: (e.target as HTMLInputElement).value }
                  : c
              );
              setContacts(newContacts);
              setEditingContact(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingContact(record.id)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string, record: ContactPerson) => (
        editingContact === record.id ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newContacts = contacts.map(c => 
                c.id === record.id 
                  ? { ...c, phone: (e.target as HTMLInputElement).value }
                  : c
              );
              setContacts(newContacts);
              setEditingContact(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingContact(record.id)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'E-Mail',
      dataIndex: 'email',
      key: 'email',
      render: (text: string, record: ContactPerson) => (
        editingContact === record.id ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newContacts = contacts.map(c => 
                c.id === record.id 
                  ? { ...c, email: (e.target as HTMLInputElement).value }
                  : c
              );
              setContacts(newContacts);
              setEditingContact(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingContact(record.id)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'Funktion',
      dataIndex: 'function',
      key: 'function',
      render: (text: string, record: ContactPerson) => (
        editingContact === record.id ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newContacts = contacts.map(c => 
                c.id === record.id 
                  ? { ...c, function: (e.target as HTMLInputElement).value }
                  : c
              );
              setContacts(newContacts);
              setEditingContact(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingContact(record.id)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'Aktionen',
      key: 'actions',
      width: 120,
      render: (record: ContactPerson) => (
        <Space>
          {editingContact === record.id ? (
            <Button
              size="small"
              onClick={() => setEditingContact(null)}
            >
              Speichern
            </Button>
          ) : (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditingContact(record.id)}
            >
              Bearbeiten
            </Button>
          )}
          <Button
            size="small"
            color="error"
            onClick={() => {
              setContacts(contacts.filter(c => c.id !== record.id));
            }}
          >
            Löschen
          </Button>
        </Space>
      )
    }
  ];

  // Ant Design Table Spalten für Vertreter
  const representativeColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Representative) => (
        editingRepresentative === record.id ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newRepresentatives = representatives.map(r => 
                r.id === record.id 
                  ? { ...r, name: (e.target as HTMLInputElement).value }
                  : r
              );
              setRepresentatives(newRepresentatives);
              setEditingRepresentative(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingRepresentative(record.id)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string, record: Representative) => (
        editingRepresentative === record.id ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newRepresentatives = representatives.map(r => 
                r.id === record.id 
                  ? { ...r, phone: (e.target as HTMLInputElement).value }
                  : r
              );
              setRepresentatives(newRepresentatives);
              setEditingRepresentative(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingRepresentative(record.id)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'E-Mail',
      dataIndex: 'email',
      key: 'email',
      render: (text: string, record: Representative) => (
        editingRepresentative === record.id ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newRepresentatives = representatives.map(r => 
                r.id === record.id 
                  ? { ...r, email: (e.target as HTMLInputElement).value }
                  : r
              );
              setRepresentatives(newRepresentatives);
              setEditingRepresentative(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingRepresentative(record.id)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'Territorium',
      dataIndex: 'territory',
      key: 'territory',
      render: (text: string, record: Representative) => (
        editingRepresentative === record.id ? (
          <Input 
            defaultValue={text}
            onPressEnter={(e) => {
              const newRepresentatives = representatives.map(r => 
                r.id === record.id 
                  ? { ...r, territory: (e.target as HTMLInputElement).value }
                  : r
              );
              setRepresentatives(newRepresentatives);
              setEditingRepresentative(null);
            }}
          />
        ) : (
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setEditingRepresentative(record.id)}
          >
            {text}
          </span>
        )
      )
    },
    {
      title: 'Aktionen',
      key: 'actions',
      width: 120,
      render: (record: Representative) => (
        <Space>
          {editingRepresentative === record.id ? (
            <Button
              size="small"
              onClick={() => setEditingRepresentative(null)}
            >
              Speichern
            </Button>
          ) : (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditingRepresentative(record.id)}
            >
              Bearbeiten
            </Button>
          )}
          <Button
            size="small"
            color="error"
            onClick={() => {
              setRepresentatives(representatives.filter(r => r.id !== record.id));
            }}
          >
            Löschen
          </Button>
        </Space>
      )
    }
  ];

  const handleAddContact = () => {
    const newContact: ContactPerson = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      function: ''
    };
    setContacts([...contacts, newContact]);
    setEditingContact(newContact.id);
  };

  const handleAddRepresentative = () => {
    const newRepresentative: Representative = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      territory: ''
    };
    setRepresentatives([...representatives, newRepresentative]);
    setEditingRepresentative(newRepresentative.id);
  };

  const onSubmit = (data: OrderConfirmationData) => {
    const confirmationData: OrderConfirmationData = {
      ...data,
      contacts,
      representatives,
      date: data.date || new Date()
    };
    onSave(confirmationData);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-4">
            <Typography variant="h6">Allgemeine Kundendaten</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="general.name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Firmenname"
                      disabled={mode === 'view'}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="general.address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Adresse"
                      multiline
                      rows={3}
                      disabled={mode === 'view'}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="general.phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Telefon"
                      disabled={mode === 'view'}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="general.email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="E-Mail"
                      disabled={mode === 'view'}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Typography variant="h6">Kontaktpersonen</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddContact}
                disabled={mode === 'view'}
              >
                Kontakt hinzufügen
              </Button>
            </div>
            <Table
              columns={contactColumns}
              dataSource={contacts}
              rowKey="id"
              pagination={false}
            />
          </div>
        );

      case 'representatives':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Typography variant="h6">Vertreter</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRepresentative}
                disabled={mode === 'view'}
              >
                Vertreter hinzufügen
              </Button>
            </div>
            <Table
              columns={representativeColumns}
              dataSource={representatives}
              rowKey="id"
              pagination={false}
            />
          </div>
        );

      default:
        return (
          <Alert severity="info">
            Bereich "{navigationItems.find(item => item.id === activeSection)?.label}" wird implementiert.
          </Alert>
        );
    }
  };

  return (
    <div className="flex h-screen">
      {/* Navigationsbaum */}
      <Card className="w-64 mr-4">
        <Box className="p-4">
          <Typography variant="h6" className="mb-4">Navigation</Typography>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Card>

      {/* Hauptinhalt */}
      <div className="flex-1 space-y-6">
        {/* Kopfbereich */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5">
              {mode === 'create' ? 'Neue Auftragsbestätigung' : 
               mode === 'edit' ? 'Auftragsbestätigung bearbeiten' : 'Auftragsbestätigung anzeigen'}
            </Typography>
            <div className="flex space-x-2">
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                disabled={mode === 'create'}
              >
                Drucken
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={mode === 'create'}
              >
                Löschen
              </Button>
            </div>
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Controller
                name="orderNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Auftragsnummer"
                    error={!!errors.orderNumber}
                    helperText={errors.orderNumber?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    placeholder="Datum"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date?.toDate())}
                    disabled={mode === 'view'}
                    style={{ width: '100%' }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="customerNumber"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.customerNumber}>
                    <InputLabel>Kundennummer</InputLabel>
                    <Select {...field} label="Kundennummer" disabled={mode === 'view'}>
                      {customers.map(customer => (
                        <MenuItem key={customer} value={customer}>{customer}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status" disabled={mode === 'view'}>
                      {statuses.map(status => (
                        <MenuItem key={status} value={status}>
                          {status === 'draft' ? 'Entwurf' :
                           status === 'confirmed' ? 'Bestätigt' :
                           status === 'in_progress' ? 'In Bearbeitung' :
                           status === 'completed' ? 'Abgeschlossen' :
                           status === 'cancelled' ? 'Storniert' : status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="phoneContact"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Telefonkontakt"
                    error={!!errors.phoneContact}
                    helperText={errors.phoneContact?.message}
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="creditLimit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Kreditlimit"
                    type="number"
                    disabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="branch"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.branch}>
                    <InputLabel>Niederlassung</InputLabel>
                    <Select {...field} label="Niederlassung" disabled={mode === 'view'}>
                      {branches.map(branch => (
                        <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Bereichs-Content */}
        <Card className="p-6">
          {renderSectionContent()}
        </Card>

        {/* Aktions-Buttons */}
        {mode !== 'view' && (
          <Card className="p-4">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
              >
                Abbrechen
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit(onSubmit)}
              >
                Speichern
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation; 