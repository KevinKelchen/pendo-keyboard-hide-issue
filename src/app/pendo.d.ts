// Add currently undocumented Pendo API methods (use with caution)
declare namespace pendo {
  interface Pendo {
    areGuidesDisabled: () => boolean;
    setGuidesDisabled: (disabled: boolean) => void;
    isSendingEvents: () => boolean;
    startSendingEvents: () => void;
    stopSendingEvents: () => void;
    clearSession: () => void;
  }
}
