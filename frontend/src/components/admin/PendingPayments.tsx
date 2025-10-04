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
import API from '../../services/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Payment {
  _id: string;
  userId: string;
  contentId: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  userName?: string;
  userEmail?: string;
  contentTitle?: string;
  deleted?: boolean;
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
        console.log('🔄 Fetching payments from API...');
        const response = await API.get('/payments/all');
        
        console.log('📊 Payments loaded:', response.data.length, 'payments');
        setPayments(response.data);
      } catch (err) {
        console.error('❌ Error fetching payments:', err);
        alert('Failed to load payments. Check console for details.');
      }
    };

    fetchPayments();
  }, []);

  const handleApprove = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to approve this payment?')) {
      try {
        console.log('🔄 Approving payment:', paymentId);
        // Temporary workaround: Use PUT with action parameter
        const response = await API.put(`/payments/${paymentId}?action=approve`);
        console.log('✅ Approve response:', response.data);
        
        // Update payment status in local state
        setPayments(prev => prev.map(p => 
          p._id === paymentId ? { ...p, status: 'approved' } : p
        ));
        alert('✅ Payment approved successfully!');
      } catch (err: any) {
        console.error('❌ Error approving payment:', err);
        console.error('Error details:', err.response?.data || err.message);
        alert(`Error approving payment: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleReject = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to decline this payment?')) {
      try {
        console.log('🔄 Declining payment:', paymentId);
        // Temporary workaround: Use PUT with action parameter
        const response = await API.put(`/payments/${paymentId}?action=decline`);
        console.log('✅ Decline response:', response.data);
        
        // Update payment status in local state
        setPayments(prev => prev.map(p => 
          p._id === paymentId ? { ...p, status: 'declined' } : p
        ));
        alert('❌ Payment declined successfully!');
      } catch (err: any) {
        console.error('❌ Error declining payment:', err);
        console.error('Error details:', err.response?.data || err.message);
        alert(`Error declining payment: ${err.response?.data?.message || err.message}`);
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
      (filterStatus === 'approved' && p.status === 'approved') ||
      (filterStatus === 'rejected' && p.status === 'declined') ||
      (filterStatus === 'pending' && p.status === 'pending');

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
            <option value="pending">Pending</option>
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
              <th className="p-3 text-left">Status</th>
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
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    p.status === 'approved' ? 'bg-green-800 text-green-200' :
                    p.status === 'declined' ? 'bg-red-800 text-red-200' :
                    'bg-yellow-800 text-yellow-200'
                  }`}>
                    {p.status?.toUpperCase() || 'PENDING'}
                  </span>
                </td>
                <td className="p-3 text-gray-400">{formatTime(p.createdAt)}</td>
                <td className="p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
                    {/* Always show Approve/Decline buttons for admin control */}
                    <button
                      className={`flex items-center gap-1 text-white px-3 py-1 rounded text-sm ${
                        p.status === 'approved' 
                          ? 'bg-green-900 text-green-300 cursor-default' 
                          : 'bg-green-800 hover:bg-green-700'
                      }`}
                      onClick={() => handleApprove(p._id)}
                      disabled={p.status === 'approved'}
                    >
                      <CheckCircle className="w-4 h-4" /> 
                      {p.status === 'approved' ? 'Approved ✓' : 'Approve'}
                    </button>
                    
                    <button
                      className={`flex items-center gap-1 text-white px-3 py-1 rounded text-sm ${
                        p.status === 'declined' 
                          ? 'bg-red-900 text-red-300 cursor-default' 
                          : 'bg-red-800 hover:bg-red-700'
                      }`}
                      onClick={() => handleReject(p._id)}
                      disabled={p.status === 'declined'}
                    >
                      <XCircle className="w-4 h-4" /> 
                      {p.status === 'declined' ? 'Declined ✗' : 'Decline'}
                    </button>

                    <button
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                      title="Details"
                      onClick={() => setSelectedPayment(p)}
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
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
