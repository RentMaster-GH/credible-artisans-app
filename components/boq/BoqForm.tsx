// components/boq/BoqForm.tsx
'use client';

import React, { useState } from 'react';
import { calculateBoqTotals } from '@/lib/boq';
import { BoqItem } from '@/types/boq';

interface Props {
  artisanId: string;
  onSuccess?: () => void;
}

export const BoqForm: React.FC<Props> = ({ artisanId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [validUntil, setValidUntil] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [items, setItems] = useState<Omit<BoqItem, 'id' | 'boq_id'>[]>([
    { description: '', quantity: 1, unit: 'pcs', unit_price: 0, total_price: 0 },
  ]);

  const handleItemChange = (index: number, field: keyof BoqItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto calculate item total price
    if (field === 'quantity' || field === 'unit_price') {
      const q = Number(updated[index].quantity || 0);
      const p = Number(updated[index].unit_price || 0);
      updated[index].total_price = Number((q * p).toFixed(2));
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'pcs', unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totals = calculateBoqTotals(items, taxRate, discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artisanId,
          title,
          client_id: clientId,
          tax_rate: taxRate,
          discount_amount: discountAmount,
          notes,
          valid_until: validUntil || null,
          items,
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to submit BOQ');

      alert('Bill of Quantities sent to client successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow border space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Generate Bill of Quantities (BOQ)</h2>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Project / Job Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bathroom Tiling & Piping"
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Client User ID *</label>
          <input
            type="text"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter Client ID or Email"
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>
      </div>

      {/* Dynamic Line Items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Itemized Materials & Labor</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-gray-50 p-3 rounded border">
              <input
                type="text"
                placeholder="Description (e.g. 50kg Cement Bag)"
                required
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="flex-grow border rounded p-2 text-sm"
              />
              <input
                type="number"
                min="0.1"
                step="any"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                className="w-20 border rounded p-2 text-sm"
              />
              <input
                type="text"
                placeholder="Unit (pcs, bags, hrs)"
                value={item.unit}
                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                className="w-24 border rounded p-2 text-sm"
              />
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Unit Price ($)"
                value={item.unit_price}
                onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                className="w-28 border rounded p-2 text-sm"
              />
              <div className="w-28 text-right font-medium text-sm">
                ${(item.quantity * item.unit_price).toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700 font-bold px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 text-sm text-blue-600 font-semibold hover:underline"
        >
          + Add Line Item
        </button>
      </div>

      {/* Financial Calculations */}
      <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid Until Date</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1 border rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes / Terms & Conditions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 50% deposit required before start of work."
              className="mt-1 border rounded-md p-2 w-full text-sm"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md space-y-2 text-right">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span>Tax Rate (%):</span>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-20 border rounded p-1 text-right text-sm"
            />
          </div>
          <div className="flex justify-between text-sm items-center">
            <span>Discount ($):</span>
            <input
              type="number"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              className="w-20 border rounded p-1 text-right text-sm"
            />
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 text-blue-900">
            <span>Grand Total:</span>
            <span>${totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting BOQ...' : 'Send BOQ to Client'}
      </button>
    </form>
  );
};
