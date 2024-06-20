"use client";

import { SiGithub, SiGoogle } from "react-icons/si";
import { Button } from "./ui/button";
import { handleSignin } from "@/lib/actions";

type Props = {
  provider: "github" | "google";
};

export default function ButtonSignIn({ provider }: Props) {
  return (
    <Button
      className="p-7 bg-textMain text-backgroundM flex gap-2 items-center text-lg justify-center hover:bg-gray-300 transition-all active:bg-gray-400"
      onClick={async () => {
        handleSignin(provider);
      }}
    >
      <span>{provider === "github" ? <SiGithub /> : <SiGoogle />}</span>
      Continue with {provider === "github" ? "Github" : "Google"}
    </Button>
  );
}
