// lib/boq.ts
import { CreateBoqInput, BoqStatus, Boq } from '@/types/boq';
import { backend } from '@/lib/backend';

export function calculateBoqTotals(
  items: Array<{ quantity: number; unit_price: number }>,
  taxRate: number = 0,
  discountAmount: number = 0
) {
  const subtotal = items.reduce((acc, item) => {
    return acc + Number(item.quantity || 0) * Number(item.unit_price || 0);
  }, 0);

  const taxAmount = (subtotal * Number(taxRate || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - Number(discountAmount || 0));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}

export function generateBoqNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BOQ-${dateStr}-${randomStr}`;
}

export async function createBoq(input: CreateBoqInput, artisanId: string) {
  const { subtotal, taxAmount, grandTotal } = calculateBoqTotals(
    input.items,
    input.tax_rate,
    input.discount_amount
  );

  const boqNumber = generateBoqNumber();

  const itemsWithTotals = input.items.map((item, index) => ({
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    total_price: Number((item.quantity * item.unit_price).toFixed(2)),
    sort_order: index,
  }));

  const created = await backend.create<any>('boqs', {
    boq_number: boqNumber,
    title: input.title,
    artisan_id: artisanId,
    client_id: input.client_id,
    status: 'sent',
    subtotal,
    tax_rate: input.tax_rate || 0,
    tax_amount: taxAmount,
    discount_amount: input.discount_amount || 0,
    grand_total: grandTotal,
    notes: input.notes || null,
    valid_until: input.valid_until || null,
    items: itemsWithTotals,
  });

  return { id: created.id, ...(created.data || created) } as Boq;
}

export async function getBoqsForArtisan(artisanId: string) {
  const records = await backend.list<any>('boqs');
  return records
    .map((r) => ({ id: r.id, created_at: r.created_at, ...(r.data || r) }))
    .filter((b) => b.artisan_id === artisanId) as Boq[];
}

export async function getBoqsForClient(clientId: string) {
  const records = await backend.list<any>('boqs');
  return records
    .map((r) => ({ id: r.id, created_at: r.created_at, ...(r.data || r) }))
    .filter((b) => b.client_id === clientId) as Boq[];
}

export async function getBoqById(boqId: string) {
  const records = await backend.list<any>('boqs');
  const found = records.find((r) => r.id === boqId);
  if (!found) throw new Error('BOQ not found');
  return { id: found.id, created_at: found.created_at, ...(found.data || found) } as Boq;
}

export async function updateBoqStatus(boqId: string, status: BoqStatus, notes?: string) {
  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (notes) updateData.notes = notes;

  const updated = await backend.update<any>('boqs', boqId, updateData);
  return { id: updated.id, ...(updated.data || updated) } as Boq;
}
