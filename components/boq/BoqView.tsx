// components/boq/BoqView.tsx
'use client';

import React, { useState } from 'react';
import { Boq, BoqStatus } from '@/types/boq';
import { BoqStatusBadge } from './BoqStatusBadge';

interface Props {
  boq: Boq;
  isClient?: boolean;
}

export const BoqView: React.FC<Props> = ({ boq, isClient = false }) => {
  const [currentStatus, setCurrentStatus] = useState<BoqStatus>(boq.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'revision_requested') => {
    if (!confirm(`Are you sure you want to mark this BOQ as ${status}?`)) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/boq/${boq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.error || 'Failed to update status');

      setCurrentStatus(status);
      alert(`BOQ has been updated to ${status}.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow border space-y-6 printable">
      {/* Document Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BILL OF QUANTITIES</h1>
          <p className="text-sm text-gray-500">Ref #: {boq.boq_number}</p>
          <p className="text-sm text-gray-500">Date: {new Date(boq.created_at).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <BoqStatusBadge status={currentStatus} />
          {boq.valid_until && (
            <p className="text-xs text-gray-500 mt-2">Valid Until: {boq.valid_until}</p>
          )}
        </div>
      </div>

      {/* Metadata / Parties */}
      <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
        <div>
          <p className="font-bold text-gray-700">Artisan / Contractor:</p>
          <p>{boq.artisan?.full_name || 'Artisan'}</p>
          <p>{boq.artisan?.email}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">Client:</p>
          <p>{boq.client?.full_name || 'Client'}</p>
          <p>{boq.client?.email}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800">{boq.title}</h3>

      {/* Items Table */}
      <table className="w-full text-left border-collapse border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 border">#</th>
            <th className="p-3 border">Description</th>
            <th className="p-3 border text-center">Qty</th>
            <th className="p-3 border text-center">Unit</th>
            <th className="p-3 border text-right">Unit Price</th>
            <th className="p-3 border text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {boq.items?.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-3 border">{index + 1}</td>
              <td className="p-3 border">{item.description}</td>
              <td className="p-3 border text-center">{item.quantity}</td>
              <td className="p-3 border text-center">{item.unit}</td>
              <td className="p-3 border text-right">${Number(item.unit_price).toFixed(2)}</td>
              <td className="p-3 border text-right font-medium">${Number(item.total_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Calculations */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-right text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>${Number(boq.subtotal).toFixed(2)}</span>
          </div>
          {boq.tax_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax ({boq.tax_rate}%):</span>
              <span>${Number(boq.tax_amount).toFixed(2)}</span>
            </div>
          )}
          {boq.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-${Number(boq.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2 text-gray-900">
            <span>Grand Total:</span>
            <span>${Number(boq.grand_total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {boq.notes && (
        <div className="border-t pt-4 text-xs text-gray-600">
          <p className="font-bold">Notes & Terms:</p>
          <p>{boq.notes}</p>
        </div>
      )}

      {/* Client Actions */}
      {isClient && currentStatus === 'sent' && (
        <div className="border-t pt-6 flex gap-4 justify-end no-print">
          <button
            onClick={() => handleStatusUpdate('rejected')}
            disabled={updating}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 disabled:opacity-50"
          >
            Reject BOQ
          </button>
          <button
            onClick={() => handleStatusUpdate('approved')}
            disabled={updating}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50"
          >
            Approve BOQ
          </button>
        </div>
      )}

      {/* Print Button */}
      <div className="text-right pt-4 no-print">
        <button
          onClick={() => window.print()}
          className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          🖨️ Print / Download PDF
        </button>
      </div>
    </div>
  );
};