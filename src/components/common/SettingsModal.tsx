import { useState } from "react";
import { X, Save, Moon, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // ✅ Fixed import path

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  if (!isOpen) return null;

  const handleSave = () => {
    // Save settings logic here (theme, preferences, etc.)
    console.log("Settings saved:", { theme });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* User Info */}
          <div>
            <p className="text-sm text-gray-400">Signed in as:</p>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>

          {/* Theme Toggle */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Theme</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center space-x-2 px-3 py-2 rounded ${
                  theme === "light"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center space-x-2 px-3 py-2 rounded ${
                  theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 border-t border-gray-800 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};
