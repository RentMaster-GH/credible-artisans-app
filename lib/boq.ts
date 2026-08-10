// lib/boq.ts

import { BoqItem, CreateBoqInput, BoqStatus, Boq } from '@/types/boq';
import { supabase } from '@/lib/supabaseClient';

/**
 * Helper to calculate subtotal, tax amount, and grand total for a BOQ
 */
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

/**
 * Generates a unique readable BOQ number e.g. BOQ-20231025-A1B2
 */
export function generateBoqNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BOQ-${dateStr}-${randomStr}`;
}

/**
 * Creates a new BOQ along with its line items
 */
export async function createBoq(input: CreateBoqInput, artisanId: string) {
  const { subtotal, taxAmount, grandTotal } = calculateBoqTotals(
    input.items,
    input.tax_rate,
    input.discount_amount
  );

  const boqNumber = generateBoqNumber();

  // 1. Insert into boqs table
  const { data: boq, error: boqError } = await (supabase.from as any)('boqs')
    .insert({
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
    })
    .select()
    .single();

  if (boqError) throw new Error(`Failed to create BOQ: ${boqError.message}`);

  // 2. Insert line items into boq_items table
  const itemsToInsert = input.items.map((item, index) => ({
    boq_id: boq.id,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    total_price: Number((item.quantity * item.unit_price).toFixed(2)),
    sort_order: index,
  }));

  const { error: itemsError } = await supabase
    .from('boq_items')
    .insert(itemsToInsert);

  if (itemsError) throw new Error(`Failed to insert BOQ items: ${itemsError.message}`);

  return boq;
}

/**
 * Fetch all BOQs created by a specific Artisan
 */
export async function getBoqsForArtisan(artisanId: string) {
  const { data, error } = await supabase
    .from('boqs')
    .select(`
      *,
      client:client_id (id, full_name, email)
    `)
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Boq[];
}

/**
 * Fetch all BOQs assigned to a specific Client
 */
export async function getBoqsForClient(clientId: string) {
  const { data, error } = await supabase
    .from('boqs')
    .select(`
      *,
      artisan:artisan_id (id, full_name, email)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Boq[];
}

/**
 * Fetch a single BOQ with all its line items and details
 */
export async function getBoqById(boqId: string) {
  const { data: boq, error: boqError } = await supabase
    .from('boqs')
    .select(`
      *,
      artisan:artisan_id (id, full_name, email),
      client:client_id (id, full_name, email)
    `)
    .eq('id', boqId)
    .single();

  if (boqError) throw new Error(boqError.message);

  const { data: items, error: itemsError } = await supabase
    .from('boq_items')
    .select('*')
    .eq('boq_id', boqId)
    .order('sort_order', { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  return { ...boq, items } as Boq;
}

/**
 * Update status of a BOQ (e.g. Client approves or rejects)
 */
export async function updateBoqStatus(boqId: string, status: BoqStatus, notes?: string) {
  const updateData: Record<string, any> = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  if (notes) updateData.notes = notes;

  const { data, error } = await supabase
    .from('boqs')
    .update(updateData)
    .eq('id', boqId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Boq;
}
