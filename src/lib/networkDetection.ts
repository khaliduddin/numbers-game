// Network detection utility

// Initialize network status
let isOnline = navigator.onLine;

// Set up event listeners for online/offline status
window.addEventListener("online", () => {
  isOnline = true;
  console.log("Application is online");
  // Dispatch custom event
  window.dispatchEvent(
    new CustomEvent("networkStatusChange", { detail: { online: true } }),
  );
});

window.addEventListener("offline", () => {
  isOnline = false;
  console.log("Application is offline");
  // Dispatch custom event
  window.dispatchEvent(
    new CustomEvent("networkStatusChange", { detail: { online: false } }),
  );
});

export const networkStatus = {
  isOnline: () => isOnline,
  addStatusChangeListener: (callback: (online: boolean) => void) => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ online: boolean }>;
      callback(customEvent.detail.online);
    };
    window.addEventListener("networkStatusChange", handler);
    return () => window.removeEventListener("networkStatusChange", handler);
  },
};
