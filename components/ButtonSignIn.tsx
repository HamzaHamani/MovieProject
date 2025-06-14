"use client";
import {
  SiGithub,
  SiGoogle,
  SiTwitter,
  SiFacebook,
  SiReddit,
} from "react-icons/si";
import { Button } from "./ui/button";
import { handleSignin } from "@/lib/actions";
import { toast } from "sonner";

type Props = {
  provider: "github" | "google" | "twitter" | "facebook" | "reddit";
};

export default function ButtonSignIn({ provider }: Props) {
  async function handle() {
    try {
      toast.loading("Redirecting to Sign in...");
      await handleSignin(provider);
      toast.dismiss();
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to sign in");
    }
  }

  let icon = null;
  let label = "";

  switch (provider) {
    case "google":
      icon = <SiGoogle className="mr-2 h-5 w-5" />;
      label = "Continue with Google";
      break;
    case "github":
      icon = <SiGithub className="mr-2 h-5 w-5" />;
      label = "Continue with GitHub";
      break;
    case "twitter":
      icon = <SiTwitter className="mr-2 h-5 w-5" />;
      label = "Continue with Twitter";
      break;
    case "facebook":
      icon = <SiFacebook className="mr-2 h-5 w-5" />;
      label = "Continue with Facebook";
      break;
    case "reddit":
      icon = <SiReddit className="mr-2 h-5 w-5" />;
      label = "Continue with Reddit";
      break;
  }

  return (
    <form action={handle} className="w-full">
      <div>
        <Button
          variant="outline"
          className="relative flex h-12 w-full items-center justify-center gap-2 border-gray-600 bg-transparent text-white hover:bg-gray-300"
        >
          <span className="absolute left-4 flex w-6 items-center justify-center">
            {icon}
          </span>
          <span className="flex-1 text-center">{label}</span>
        </Button>
      </div>
    </form>
  );
}
