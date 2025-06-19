// Debug utility to control console logging
const DEBUG_ENABLED = process.env.NODE_ENV === 'development' && process.env.DEBUG_LOGGING !== 'false';

export const debugLog = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.log(...args);
  }
};

export const debugError = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.error(...args);
  }
};

// Suppress punishment-related logging
export const suppressPunishmentLogs = () => {
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('punishment') || message.includes('PUNISHMENT') || 
        message.includes('BLACKLIST') || message.includes('BAN') || 
        message.includes('uuid') && message.includes('addedAt')) {
      return; // Suppress punishment logs
    }
    originalLog(...args);
  };
};

// Call this to suppress punishment logs
if (typeof window !== 'undefined') {
  suppressPunishmentLogs();
} 