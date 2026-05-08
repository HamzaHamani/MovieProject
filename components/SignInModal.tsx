"use client";
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DivSignin from "./divSignin";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SignInModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-700 bg-[#111111] text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign in</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose your preferred sign in method
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DivSignin onSignInClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
