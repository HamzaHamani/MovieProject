"use client";
import React, { ReactNode } from "react";
import { useSignInModal } from "@/hooks/useSignInModal";
import SignInModal from "@/components/SignInModal";

type Props = {
  children: ReactNode;
};

export default function SignInModalProvider({ children }: Props) {
  const { isOpen, openModal, closeModal } = useSignInModal();

  return (
    <>
      {children}
      <SignInModal open={isOpen} onOpenChange={closeModal} />
    </>
  );
}
