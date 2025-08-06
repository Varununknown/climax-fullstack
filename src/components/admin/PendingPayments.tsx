import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { PaymentDetailsModal } from '../../components/admin/PaymentDetailsModal';

interface Payment {
  _id: string;
  userId: string;
  contentId: string;
  amount: number;
  transactionId: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  contentTitle?: string;
}

export const PendingPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/payments/all');
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        console.error('❌ Error fetching payments:', err);
      }
    };

    fetchPayments();
  }, []);

  const handleApprove = (paymentId: string) => {
    alert('✅ Payment already approved by user (via instant logic). No need to modify DB.');
  };

  const handleReject = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to reject and delete this payment?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/payments/${paymentId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setPayments((prev) => prev.filter((p) => p._id !== paymentId));
          alert('❌ Payment rejected and removed from DB');
        } else {
          alert('Error rejecting payment');
        }
      } catch (err) {
        console.error('❌ Error rejecting payment:', err);
      }
    }
  };

  const handleDownloadTxnIds = () => {
    const filtered = payments.filter(p =>
      p.createdAt.startsWith(selectedDate)
    );
    if (filtered.length === 0) {
      alert('No transactions found for selected date');
      return;
    }
    const content = filtered.map(p => p.transactionId).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `txn-ids-${selectedDate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contentTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'approved' && !p.deleted) ||
      (filterStatus === 'rejected' && p.deleted);

    return matchSearch && matchStatus;
  });

  const formatTime = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Verification</h3>
        <p className="text-gray-400">Approve or decline user payments</p>
      </div>

      {/* Filter/Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-gray-900 p-4 rounded-lg border border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-3 py-2 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* 📁 Download Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm"
          max={new Date().toISOString().split('T')[0]}
        />
        <button
          onClick={handleDownloadTxnIds}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          <Download className="w-4 h-4" /> Download Txn IDs
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Content</th>
              <th className="p-3 text-left">Transaction ID</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p._id} className="border-t border-gray-800 text-white">
                <td className="p-3">
                  <div>
                    <p className="font-semibold">{p.userName}</p>
                    <p className="text-sm text-gray-400">{p.userEmail}</p>
                  </div>
                </td>
                <td className="p-3">{p.contentTitle}</td>
                <td className="p-3 font-mono">{p.transactionId}</td>
                <td className="p-3 text-green-400">₹{p.amount}</td>
                <td className="p-3 text-gray-400">{formatTime(p.createdAt)}</td>
                <td className="p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
                    <button
                      className="flex items-center gap-1 bg-green-800 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                      onClick={() => handleApprove(p._id)}
                    >
                      <CheckCircle className="w-5 h-5" /> Approve
                    </button>
                    <button
                      className="flex items-center gap-1 bg-red-800 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                      onClick={() => handleReject(p._id)}
                    >
                      <XCircle className="w-5 h-5" /> Decline
                    </button>
                    <button
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                      title="Details"
                      onClick={() => setSelectedPayment(p)}
                    >
                      <Eye className="w-5 h-5" /> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};
