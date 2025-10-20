// Suppress the passive event listener warning from React
// This is a known React synthetic event issue that doesn't affect functionality

if (typeof window !== 'undefined') {
  // Override console.error to suppress the specific warning
  const originalError = console.error;
  console.error = function(...args: any[]) {
    // Suppress passive event listener warning
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('Unable to preventDefault inside passive event listener')
    ) {
      return; // Suppress this specific warning
    }
    originalError.apply(console, args);
  };
}
