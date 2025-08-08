// Temporär auskommentiert - wird durch DeliveryNoteForm ersetzt

export interface DeliveryNoteData {
  id: string;
  deliveryNumber: string;
  deliveryDate: string;
  supplier: string;
  items: DeliveryNoteItem[];
  status: string;
}

export interface DeliveryNoteItem {
  id: string;
  articleNumber: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface DeliveryNoteProps {
  onDeliveryCreate: (delivery: DeliveryNoteData) => void;
  onDeliveryUpdate: (id: string, delivery: Partial<DeliveryNoteData>) => void;
  onDeliveryDelete: (id: string) => void;
}

export const DeliveryNote: React.FC<DeliveryNoteProps> = ({
  onDeliveryCreate,
  onDeliveryUpdate,
  onDeliveryDelete
}) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Delivery Note</h1>
      <p className="text-gray-600">Diese Komponente wird durch DeliveryNoteForm ersetzt.</p>
    </div>
  );
}; 