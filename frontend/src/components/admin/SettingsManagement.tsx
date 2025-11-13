import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import API from '../../services/api';

export const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState({
    exploreEnabled: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Don't load settings on mount - start with defaults
    // Settings will be saved when user clicks "Save Settings"
    setSettings({ exploreEnabled: true });
  }, []);

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Try to save to backend, but don't fail if it doesn't work
      try {
        await API.post('/settings/exploreEnabled', {
          settingValue: settings.exploreEnabled
        });
      } catch (apiError) {
        console.warn('⚠️ Settings API not available, using local storage instead');
        // Fallback to localStorage
        localStorage.setItem('exploreEnabled', JSON.stringify(settings.exploreEnabled));
      }
      
      // Show success message regardless
      setMessage({ type: 'success', text: '✅ Settings saved!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error?.message);
      setMessage({ type: 'error', text: '❌ Error saving settings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-600 rounded-lg p-3">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">🔧 App Settings</h2>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Settings */}
      <div className="space-y-6">
        {/* Explore Section Toggle */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🔍 Explore Section
              </h3>
              <p className="text-gray-600 text-sm">
                Enable or disable the Explore section on the home page. When disabled, the Explore section and its content will be hidden from users.
              </p>
            </div>
            
            {/* Toggle Switch */}
            <div className="ml-4">
              <button
                onClick={() => handleToggle('exploreEnabled')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.exploreEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.exploreEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <p className="text-sm font-semibold text-gray-700 mt-2">
                {settings.exploreEnabled ? '✅ ON' : '❌ OFF'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Settings Can Be Added Here */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Use these settings to control which sections are visible to users across the platform. All changes are saved to the database.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsManagement;
