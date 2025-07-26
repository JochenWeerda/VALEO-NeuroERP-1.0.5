import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Customer, ContactPerson, ContactPersonFormData } from '../../../types/crm';
import { 
  useContactPersons, 
  useCreateContactPerson, 
  useUpdateContactPerson, 
  useDeleteContactPerson 
} from '../../../hooks/useCRM';
import { 
  mapApiContactToFormData, 
  mapFormDataToApiContact 
} from '../../../types/crm';
import { ContactList } from '../contacts/ContactList';
import { ContactForm } from '../contacts/ContactForm';

interface CustomerContactsTabProps {
  customer: Customer;
  currentSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onCustomerChange?: (customer: Customer) => void;
}

const CustomerContactsTab: React.FC<CustomerContactsTabProps> = ({
  customer
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPersonFormData | null>(null);

  // API Hooks
  const { 
    data: contacts = [], 
    isLoading, 
    error, 
    refetch 
  } = useContactPersons(customer.id);

  const createContactMutation = useCreateContactPerson();
  const updateContactMutation = useUpdateContactPerson();
  const deleteContactMutation = useDeleteContactPerson();

  const handleAddContact = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };

  const handleEditContact = (contact: ContactPerson) => {
    const formData = mapApiContactToFormData(contact);
    setEditingContact(formData);
    setIsFormOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContactMutation.mutateAsync(contactId);
      refetch();
    } catch (error) {
      console.error('Fehler beim Löschen des Kontakts:', error);
    }
  };

  const handleSaveContact = async (formData: ContactPersonFormData) => {
    try {
      if (editingContact) {
        // Update existing contact
        const contactId = contacts.find(c => 
          c.firstName === editingContact.firstName && 
          c.lastName === editingContact.lastName
        )?.id;
        
        if (contactId) {
          await updateContactMutation.mutateAsync({ id: contactId, formData });
        }
      } else {
        // Create new contact
        await createContactMutation.mutateAsync(formData);
      }
      
      setIsFormOpen(false);
      setEditingContact(null);
      refetch();
    } catch (error) {
      console.error('Fehler beim Speichern des Kontakts:', error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  const isLoadingAny = isLoading || 
    createContactMutation.isPending || 
    updateContactMutation.isPending || 
    deleteContactMutation.isPending;

  const errorMessage = error?.message || 
    createContactMutation.error?.message || 
    updateContactMutation.error?.message || 
    deleteContactMutation.error?.message;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Kontaktpersonen
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddContact}
          disabled={isLoadingAny}
        >
          Kontakt hinzufügen
        </Button>
      </Box>

      {/* Error Display */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {/* Contact List */}
      {!isLoading && (
        <ContactList
          contacts={contacts}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
          isLoading={isLoading}
        />
      )}

      {/* Contact Form Dialog */}
      <ContactForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveContact}
        contact={editingContact}
        isLoading={isLoadingAny}
        error={errorMessage}
      />
    </Box>
  );
};

export default CustomerContactsTab; 