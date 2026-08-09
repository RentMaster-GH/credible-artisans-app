// types/boq.ts

export type BoqStatus = 
  | 'draft' 
  | 'sent' 
  | 'approved' 
  | 'rejected' 
  | 'revision_requested';

export interface BoqItem {
  id?: string;
  boq_id?: string;
  description: string;
  quantity: number;
  unit: string;          // e.g., "bags", "sqm", "hours", "pcs"
  unit_price: number;
  total_price: number;   // quantity * unit_price
  sort_order?: number;
  created_at?: string;
}

export interface Boq {
  id: string;
  boq_number: string;
  title: string;
  artisan_id: string;
  client_id: string;
  status: BoqStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  notes?: string | null;
  valid_until?: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations (optional joined data)
  items?: BoqItem[];
  artisan?: {
    id: string;
    full_name?: string;
    email?: string;
    phone?: string;
  };
  client?: {
    id: string;
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

// Payload interface for creating a new BOQ from the Artisan form
export interface CreateBoqInput {
  title: string;
  client_id: string;
  tax_rate?: number;
  discount_amount?: number;
  notes?: string;
  valid_until?: string;
  items: Omit<BoqItem, 'id' | 'boq_id' | 'created_at'>[];
}

// Payload interface for Client status updates (Approve / Reject)
export interface UpdateBoqStatusInput {
  status: Extract<BoqStatus, 'approved' | 'rejected' | 'revision_requested'>;
  notes?: string;
}