import React, { useState, useEffect } from 'react';
import { QrCode, Edit, Save, Copy, RefreshCw } from 'lucide-react';

interface PaymentSettings {
  upiId: string;
  qrCodeUrl: string;
  merchantName: string;
  isActive: boolean;
}

export const PaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState<PaymentSettings>({
    upiId: '',
    qrCodeUrl: '',
    merchantName: '',
    isActive: true
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/payment-settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(data);
          setTempSettings(data);
        }
      })
      .catch(err => console.error('Error loading settings:', err));
  }, []);

  const handleSave = () => {
    fetch('http://localhost:5000/api/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempSettings)
    })
      .then(res => res.json())
      .then(data => {
        setSettings(tempSettings);
        setIsEditing(false);
        alert('✅ Settings updated successfully');
      })
      .catch(err => {
        console.error('Error saving settings:', err);
        alert('❌ Failed to update settings');
      });
  };

  const handleCancel = () => {
    setTempSettings(settings!);
    setIsEditing(false);
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${tempSettings.upiId}&pn=${tempSettings.merchantName}`;
    setTempSettings(prev => ({ ...prev, qrCodeUrl: qrUrl }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!settings) return <div className="text-white">Loading settings...</div>;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Payment Settings</h3>
          <p className="text-gray-400">Configure QR code and UPI payment details</p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Save className="w-4 h-4" /><span>Save</span>
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Edit className="w-4 h-4" /><span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">UPI ID *</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={isEditing ? tempSettings.upiId : settings.upiId}
                onChange={(e) => setTempSettings(prev => ({ ...prev, upiId: e.target.value }))}
                disabled={!isEditing}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                placeholder="your-upi@bank"
              />
              <button
                onClick={() => copyToClipboard(settings.upiId)}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                title="Copy UPI ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Merchant Name *</label>
            <input
              type="text"
              value={isEditing ? tempSettings.merchantName : settings.merchantName}
              onChange={(e) => setTempSettings(prev => ({ ...prev, merchantName: e.target.value }))}
              disabled={!isEditing}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none"
              placeholder="Your Business Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">QR Code URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={isEditing ? tempSettings.qrCodeUrl : settings.qrCodeUrl}
                onChange={(e) => setTempSettings(prev => ({ ...prev, qrCodeUrl: e.target.value }))}
                disabled={!isEditing}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none text-sm"
                placeholder="QR code image URL"
              />
              {isEditing && (
                <button
                  onClick={generateQRCode}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  title="Generate QR Code"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1">Auto-generated based on UPI ID and merchant name</p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isEditing ? tempSettings.isActive : settings.isActive}
              onChange={(e) => setTempSettings(prev => ({ ...prev, isActive: e.target.checked }))}
              disabled={!isEditing}
              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-gray-300">Enable QR code payments</label>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <QrCode className="w-5 h-5 mr-2" /> QR Code Preview
          </h4>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="mb-4">
              <h5 className="text-gray-800 font-semibold">{isEditing ? tempSettings.merchantName : settings.merchantName}</h5>
              <p className="text-gray-600 text-sm">Scan to Pay</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <img
                src={isEditing ? tempSettings.qrCodeUrl : settings.qrCodeUrl}
                alt="Payment QR Code"
                className="w-48 h-48 mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=QR+Code';
                }}
              />
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>UPI ID:</span>
                <span className="font-mono text-xs">{isEditing ? tempSettings.upiId : settings.upiId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${
                  (isEditing ? tempSettings.isActive : settings.isActive) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(isEditing ? tempSettings.isActive : settings.isActive) ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> This QR code will be shown to users when they need to make payments.
              Make sure your UPI ID is correct and active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
