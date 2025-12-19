/// <reference types="vite/client" />

interface Cashfree {
  checkout(options: {
    paymentSessionId: string;
    redirectTarget?: string;
  }): void;
}

interface Window {
  Cashfree?: Cashfree;
}

