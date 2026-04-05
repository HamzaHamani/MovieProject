"use client";
import { handleLogout } from "@/lib/actions";
import { LogOut } from "lucide-react";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/notificationSystem";

export default function SignOutButton() {
  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      await handleLogout();
      showSuccessNotification(
        "Signed Out",
        "You have been logged out successfully",
      );
    } catch (error) {
      showErrorNotification(
        "Logout Failed",
        "Could not sign out. Please try again",
      );
    }
  }

  return (
    <form onSubmit={handle}>
      <button type="submit" className="flex w-[12vw]">
        <LogOut className="mr-2 h-4 w-4" /> <span>Sign out</span>
      </button>
    </form>
  );
}
