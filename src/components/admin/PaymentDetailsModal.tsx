import React from 'react';
import { X } from 'lucide-react';

interface PaymentDetailsModalProps {
  payment: {
    userName?: string;
    userEmail?: string;
    contentTitle?: string;
    amount: number;
    transactionId: string;
    createdAt: string;
  };
  onClose: () => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ payment, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-lg p-6 relative border border-gray-700">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>

        <div className="space-y-2 text-gray-300 text-sm">
          <p><span className="font-medium text-white">User Name:</span> {payment.userName || 'Unknown'}</p>
          <p><span className="font-medium text-white">Email:</span> {payment.userEmail || 'Unknown'}</p>
          <p><span className="font-medium text-white">Content Title:</span> {payment.contentTitle || 'Untitled'}</p>
          <p><span className="font-medium text-white">Transaction ID:</span> <span className="font-mono">{payment.transactionId}</span></p>
          <p><span className="font-medium text-white">Amount:</span> ₹{payment.amount}</p>
          <p><span className="font-medium text-white">Time:</span> {new Date(payment.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
