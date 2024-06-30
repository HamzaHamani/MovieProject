"use client";
import React, { useState } from "react";
import ButtonSignIn from "./ButtonSignIn";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

type Props = {};

export default function DivSignin({}: Props) {
  const searchParams = useSearchParams();
  const [toastDisplayed, setToastDisplayed] = useState(false);

  if (searchParams.get("error") && !toastDisplayed) {
    toast.error("Another account already exists with the same e-mail address");
    setToastDisplayed(true);
  }

  return (
    <div className="bg-red-70 flex items-center justify-center gap-2">
      <ButtonSignIn provider="google" />
      <ButtonSignIn provider="github" />
    </div>
  );
}
