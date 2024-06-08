import React from "react";
import { Button } from "../ui/button";
import NavbarList from "./navbarList";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Props = {};

export default function Navbar({}: Props) {
  return (
    <nav className="flex bg-red-50 justify-around p-4">
      <div>Logo</div>
      <NavbarList />

      <SignedOut>
        <SignInButton mode="modal">
          <Button>Get Started</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>User</SignedIn>
    </nav>
  );
}
