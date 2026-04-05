"use client";
import React, { useState, useEffect } from "react";
import ButtonSignIn from "./ButtonSignIn";
import { showErrorNotification } from "@/components/notificationSystem";
import { useSearchParams } from "next/navigation";

type Props = {};

export default function DivSignin({}: Props) {
  const searchParams = useSearchParams();
  const [toastDisplayed, setToastDisplayed] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") && !toastDisplayed) {
      showErrorNotification(
        "Account Error",
        "Another account already exists with the same e-mail address",
      );
      setToastDisplayed(true);
    }
  }, [searchParams, toastDisplayed]);

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
