/**
 * Utility to dynamically load Cashfree SDK
 */

let cashfreeLoaded = false;
let loadPromise: Promise<boolean> | null = null;

export const loadCashfreeSDK = (): Promise<boolean> => {
  // Return cached promise if already loading/loaded
  if (loadPromise) {
    return loadPromise;
  }

  // Return true if already loaded
  if (cashfreeLoaded && window.Cashfree) {
    console.log('✅ Cashfree SDK already loaded');
    return Promise.resolve(true);
  }

  // Create promise for loading
  loadPromise = new Promise((resolve) => {
    console.log('📥 Starting Cashfree SDK load...');

    // Check if already in window (from HTML script tag)
    if (window.Cashfree) {
      console.log('✅ Cashfree found on window object');
      cashfreeLoaded = true;
      resolve(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/core/cashfree.js';
    script.async = true;
    script.type = 'text/javascript';

    script.onload = () => {
      console.log('✅ Cashfree SDK script loaded from CDN');
      // Give it a moment to initialize
      setTimeout(() => {
        if (window.Cashfree) {
          console.log('✅ window.Cashfree is available!');
          cashfreeLoaded = true;
          resolve(true);
        } else {
          console.warn('⚠️ Script loaded but window.Cashfree still undefined');
          resolve(false);
        }
      }, 100);
    };

    script.onerror = (error) => {
      console.error('❌ Failed to load Cashfree SDK from CDN:', error);
      resolve(false);
    };

    // Add to head
    document.head.appendChild(script);
  });

  return loadPromise;
};

export const waitForCashfree = async (timeoutMs = 10000): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (window.Cashfree && window.Cashfree.checkout) {
      console.log('✅ Cashfree.checkout() is ready!');
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.error('❌ Cashfree SDK timeout after', timeoutMs, 'ms');
  return false;
};
