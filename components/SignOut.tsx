"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/notificationSystem";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handle() {
    try {
      const result = await signOut({
        redirect: false,
        callbackUrl: "/sign-in",
      });

      showSuccessNotification(
        "Signed Out",
        "You have been logged out successfully",
      );

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      showErrorNotification(
        "Logout Failed",
        "Could not sign out. Please try again",
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign out</span>
    </button>
  );
}
