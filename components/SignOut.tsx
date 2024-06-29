"use client";
import { handleLogout } from "@/lib/actions";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

//TODO SHOW LOADING INDICATOR ON SIGN OUT
export default function SignOutButton() {
  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      toast.loading("Signing  out...");
      // handleLogout();
      console.log("signing out");
      setTimeout(async () => {
        await handleLogout();
        toast.dismiss();
        toast.success("Signed out successfully");
      }, 5000);
    } catch (e) {
      toast.error("Failed to sign out");
    } finally {
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
