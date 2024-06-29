"use client";
import { handleLogout } from "@/lib/actions";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

//TODO SHOW LOADING INDICATOR ON SIGN OUT
export default function SignOutButton() {
  const handleLogoutPromise = () =>
    new Promise(async (resolve, reject) => {
      try {
        await handleLogout();
        resolve({ name: "Sonner" });
      } catch (error) {
        reject(error);
      }
    });

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    toast.promise(handleLogoutPromise(), {
      loading: "Logging out..",
      success: () => `Logged out successfully!`,
      error: "Failed to sign out",
    });
  }

  return (
    <form onSubmit={handle}>
      <button type="submit" className="flex w-[12vw]">
        <LogOut className="mr-2 h-4 w-4" /> <span>Sign out</span>
      </button>
    </form>
  );
}
