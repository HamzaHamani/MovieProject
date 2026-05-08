"use client";
import React from "react";
import { Button } from "./ui/button";
import { useSignInModal } from "@/hooks/useSignInModal";

export default function GetStartedButton() {
  const { openModal } = useSignInModal();

  return (
    <Button 
      className="bg-transparent font-extrabold hover:bg-transparent active:bg-transparent md:hidden"
      onClick={openModal}
    >
      Get Started
    </Button>
  );
}
