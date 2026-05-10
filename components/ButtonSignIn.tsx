"use client";
import { useState } from "react";
import {
  SiGithub,
  SiGoogle,
  SiTwitter,
  SiFacebook,
  SiReddit,
} from "react-icons/si";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/components/notificationSystem";

type Props = {
  provider: "github" | "google" | "twitter" | "facebook" | "reddit";
};

export default function ButtonSignIn({ provider }: Props) {
  const [isLoading, setIsLoading] = useState(false);

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

  async function handle() {
    try {
      setIsLoading(true);

      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/explore",
      });

      if (!result || result.error) {
        setIsLoading(false);
        showErrorNotification(
          "Authentication",
          "Failed to sign in. Please try again.",
        );
        return;
      }

      showSuccessNotification("Sign in", "Opening auth window...");

      if (result.url) {
        window.open(result.url, "auth-popup", "width=500,height=600");
        return;
      }
    } catch (e) {
      setIsLoading(false);
      showErrorNotification(
        "Authentication",
        "Failed to sign in. Please try again.",
      );
    }
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        onClick={() => void handle()}
        disabled={isLoading}
        variant="outline"
        className="relative flex h-12 w-full items-center justify-center gap-2 border-gray-600 bg-transparent text-white hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="absolute left-4 flex w-6 items-center justify-center">
          {icon}
        </span>
        <span className="flex-1 text-center">
          {isLoading ? "Opening..." : label}
        </span>
      </Button>
    </div>
  );
}
