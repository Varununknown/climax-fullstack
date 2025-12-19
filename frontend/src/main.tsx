import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './suppressPassiveWarning'; // Suppress React passive event listener warning

import { BrowserRouter } from 'react-router-dom'; // ✅ for routing
import { AuthProvider } from './context/AuthContext'; // ✅ for auth (adjust path if needed)

// Initialize Cashfree SDK
if (window.Cashfree) {
  console.log('✅ Cashfree SDK loaded successfully');
} else {
  console.warn('⚠️ Cashfree SDK not loaded yet, will retry in PaymentModal');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
