// Simple event-based loading bus for internal content loads (tab switches)
export function startInternalLoad() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("internal-loading-start"));
}

export function stopInternalLoad() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("internal-loading-stop"));
}
