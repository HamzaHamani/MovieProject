"use client";
import { handleLogout } from "@/lib/actions";
import toast from "react-hot-toast";

export default function SignOutButton() {
  async function handle() {
    try {
      toast.loading("Signing out...");
      handleLogout();
      console.log("Signed out successfully");
    } catch (e) {
      toast.error("Failed to sign out");
    } finally {
      toast.dismiss();
    }
  }
  return (
    <form action={handle}>
      <button type="submit">Sign out</button>
    </form>
  );
}
