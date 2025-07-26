export interface InquiryData {
  id: string;
  inquiryNumber: string;
  inquiryDate: string;
  customerNumber: string;
  customerName: string;
  contactPerson: string;
  phoneContact: string;
  emailContact: string;
  branch: string;
  inquiryType: string;
  priority: string;
  status: string;
  description: string;
  positions: InquiryPosition[];
  totalAmount: number;
  created_at: string;
  updated_at: string;
}

export interface InquiryPosition {
  id: string;
  position: number;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  netPrice: number;
  netAmount: number;
  deliveryDate: string;
  notes: string;
}

export interface InquiryProps {
  onInquiryCreate: (inquiry: InquiryData) => void;
  onInquiryUpdate: (id: string, inquiry: Partial<InquiryData>) => void;
  onInquiryDelete: (id: string) => void;
} 