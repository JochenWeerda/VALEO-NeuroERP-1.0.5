// Temporär auskommentiert - wird später implementiert

export interface OrderConfirmationData {
  id: string;
  confirmationNumber: string;
  confirmationDate: string;
  supplier: string;
  orderNumber: string;
  items: OrderConfirmationItem[];
  status: string;
}

export interface OrderConfirmationItem {
  id: string;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface OrderConfirmationProps {
  onConfirmationCreate: (confirmation: OrderConfirmationData) => void;
  onConfirmationUpdate: (id: string, confirmation: Partial<OrderConfirmationData>) => void;
  onConfirmationDelete: (id: string) => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  onConfirmationCreate,
  onConfirmationUpdate,
  onConfirmationDelete
}) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Confirmation</h1>
      <p className="text-gray-600">Diese Komponente wird später implementiert.</p>
    </div>
  );
}; 