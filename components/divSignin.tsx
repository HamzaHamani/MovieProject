"use client";
import React, { useState, useEffect } from "react";
import ButtonSignIn from "./ButtonSignIn";
import { showErrorNotification } from "@/components/notificationSystem";
import { useSearchParams } from "next/navigation";

type Props = {};

export default function DivSignin({}: Props) {
  const searchParams = useSearchParams();
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null);

  useEffect(() => {
    const errorCode = searchParams.get("error");

    if (!errorCode) {
      setLastErrorCode(null);
      return;
    }

    if (errorCode === lastErrorCode) {
      return;
    }

    const messageByCode: Record<string, string> = {
      OAuthAccountNotLinked:
        "Another account already exists with the same e-mail address.",
      AccessDenied: "Sign in was denied. Please try again.",
      Callback: "Sign in callback failed. Please try again.",
      Default: "Sign in failed. Please try again.",
    };

    const message = messageByCode[errorCode] ?? messageByCode.Default;

    showErrorNotification("Sign In Error", message);
    setLastErrorCode(errorCode);
  }, [searchParams, lastErrorCode]);

  return (
    <div className="bg-red-70 flex w-full flex-col gap-4 [&>*]:w-full">
      {" "}
      <ButtonSignIn provider="google" />
      <ButtonSignIn provider="github" />
      <ButtonSignIn provider="twitter" />
      <ButtonSignIn provider="facebook" />
      <ButtonSignIn provider="reddit" />
    </div>
  );
}
