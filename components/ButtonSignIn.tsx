"use client";
import { SiGithub, SiGoogle } from "react-icons/si";
import { Button } from "./ui/button";
import { handleSignin } from "@/lib/actions";
import { toast } from "sonner";
import { delay } from "@/lib/utils";

type Props = {
  provider: "github" | "google";
};

export default function ButtonSignIn({ provider }: Props) {
  async function handle() {
    try {
      toast.loading("Redirecting to Sign in...");
      // await delay(5000);
      await handleSignin(provider);
      toast.dismiss();
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to sign in");
    } finally {
    }
  }
  return (
    <form action={handle}>
      <Button className="flex items-center justify-center gap-2 bg-textMain p-7 text-lg text-backgroundM transition-all hover:bg-gray-300 active:bg-gray-400">
        <span>{provider === "github" ? <SiGithub /> : <SiGoogle />}</span>
        Continue with {provider === "github" ? "Github" : "Google"}
      </Button>
    </form>
  );
}
