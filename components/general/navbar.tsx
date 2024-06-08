import React from "react";
import { Button } from "../ui/button";
import NavbarList from "./navbarList";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

type Props = {};
//  TODO FIX LAYOUT SHIFT WITH SIGNED IN BUTTON WHILE USING CLERK
export default function Navbar({}: Props) {
  return (
    <nav className="flex bg-background text-text  justify-around p-4">
      <div>Logo</div>
      <NavbarList />

      <SignedOut>
        <SignInButton mode="modal">
          <Button>Get Started</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </nav>
  );
}
