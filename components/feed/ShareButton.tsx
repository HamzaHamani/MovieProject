"use client";

import { useState } from "react";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/notificationSystem";

export default function ShareButton({ href }: { href: string }) {
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    try {
      setLoading(true);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const full = origin + href;
      await navigator.clipboard.writeText(full);
      showSuccessNotification("Link copied", "Shared URL copied to clipboard");
    } catch (e) {
      showErrorNotification("Copy failed", "Could not copy link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      disabled={loading}
      className="ml-auto rounded-md bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10"
    >
      {loading ? "Copying..." : "Share"}
    </button>
  );
}
