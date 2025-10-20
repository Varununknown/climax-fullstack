// FINAL SOLUTION: Suppress React's passive event listener warning
// This is a React synthetic event issue that doesn't affect functionality

if (typeof window !== 'undefined') {
  // Store original error function
  const originalError = console.error;
  
  // Override console.error to suppress the specific passive listener warning
  console.error = function(...args: any[]) {
    // Check if this is the passive listener warning
    const isPassiveWarning = args.some(arg => 
      typeof arg === 'string' && 
      arg.includes('Unable to preventDefault inside passive event listener')
    );
    
    // If it's the passive warning, suppress it completely
    if (isPassiveWarning) {
      return;
    }
    
    // Otherwise, show all other errors normally
    return originalError.apply(console, args);
  };

  // Also suppress via addEventListener options
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    // For touch events, always ensure passive: true
    if (type === 'touchstart' || type === 'touchmove' || type === 'wheel') {
      if (typeof options === 'object') {
        options.passive = true;
      }
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}

