// components/boq/BoqStatusBadge.tsx
import React from 'react';
import { BoqStatus } from '@/types/boq';

interface Props {
  status: BoqStatus;
}

export const BoqStatusBadge: React.FC<Props> = ({ status }) => {
  const styles: Record<BoqStatus, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-300',
    sent: 'bg-blue-100 text-blue-800 border-blue-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    revision_requested: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  const labels: Record<BoqStatus, string> = {
    draft: 'Draft',
    sent: 'Pending Client Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    revision_requested: 'Revision Requested',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
};