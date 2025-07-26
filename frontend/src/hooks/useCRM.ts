// CRM Hooks für VALEO NeuroERP
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '../services/crmService';
import { Customer, ContactPerson, CustomerFilter, ContactPersonFilter, ContactPersonFormData, CustomerFormData } from '../types/crm';

// Customer Hooks
export const useCustomers = (filter?: CustomerFilter) => {
  return useQuery<Customer[], Error>({
    queryKey: ['customers', filter],
    queryFn: () => crmService.getCustomers(filter),
  });
};

export const useCustomer = (id: string) => {
  return useQuery<Customer | null, Error>({
    queryKey: ['customer', id],
    queryFn: () => crmService.getCustomerById(id),
    enabled: !!id,
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Customer, Error, { id: string; data: Partial<Customer> }>({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      crmService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};


// Contact Person Hooks
export const useContactPersons = (customerId: string, filter?: ContactPersonFilter) => {
  return useQuery<ContactPerson[], Error>({
    queryKey: ['contactPersons', customerId, filter],
    queryFn: () => crmService.getContactPersons(customerId, filter),
    enabled: !!customerId,
  });
};

export const useContactPerson = (id: string) => {
  return useQuery<ContactPerson | null, Error>({
    queryKey: ['contactPerson', id],
    queryFn: () => crmService.getContactPersonById(id),
    enabled: !!id,
  });
};

export const useCreateContactPerson = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ContactPerson, Error, ContactPersonFormData>({
    mutationFn: (formData: ContactPersonFormData) => crmService.createContactPerson(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactPersons'] });
    },
  });
};

export const useUpdateContactPerson = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ContactPerson, Error, { id: string; formData: ContactPersonFormData }>({
    mutationFn: ({ id, formData }: { id: string; formData: ContactPersonFormData }) =>
      crmService.updateContactPerson(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactPersons'] });
    },
  });
};

export const useDeleteContactPerson = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => crmService.deleteContactPerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactPersons'] });
    },
  });
}; 