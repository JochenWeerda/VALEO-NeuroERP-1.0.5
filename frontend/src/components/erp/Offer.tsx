export interface OfferData {
  id: string;
  offerNumber: string;
  date: string;
  customerNumber: string;
  customerName: string;
  contactPerson: string;
  phoneContact: string;
  emailContact: string;
  branch: string;
  offerType: string;
  priority: string;
  status: string;
  description: string;
  deliveryAddress: string;
  billingAddress: string;
  deliveryDate: string;
  paymentTerms: string;
  currency: string;
  totalNetAmount: number;
  totalGrossAmount: number;
  created_at: string;
  updated_at: string;
}

export interface OfferProps {
  onOfferCreate: (offer: OfferData) => void;
  onOfferUpdate: (id: string, offer: Partial<OfferData>) => void;
  onOfferDelete: (id: string) => void;
} 