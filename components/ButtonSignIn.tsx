"use client";

import { SiGithub } from "react-icons/si";
import { Button } from "./ui/button";
import { handleSignin } from "@/lib/actions";

type Props = {
  provider: "github" | "google";
};

export default function ButtonSignIn({ provider }: Props) {
  return (
    <Button
      className="p-6 flex gap-2 items-center justify-center"
      onClick={async () => {
        handleSignin(provider);
      }}
    >
      <span>
        <SiGithub />
      </span>
      Sign in with {provider === "github" ? "Github" : "Google"}
    </Button>
  );
}
