import React from "react";
import { Button } from "../ui/button";
import NavbarList from "./navbarList";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Logo from "./logo";

type Props = {};
//  TODO FIX LAYOUT SHIFT WITH SIGNED IN BUTTON WHILE USING CLERK
export default function Navbar({}: Props) {
  return (
    <nav className="flex w-[100rem] mx-auto rounded-full bg-[#111111] text-text   justify-around p-4">
      <Logo />
      <NavbarList />
      <Button>Get Started</Button>
    </nav>
  );
}
