import React from "react";
import { Button } from "../ui/button";
import NavbarList from "./navbarList";
import Logo from "./logo";
import Hamburger from "../ui/Hamburger";

type Props = {};
export default function Navbar({}: Props) {
  return (
    <nav className="flex w-[90%] mx-auto rounded-full bg-backgroundM text-text  xmd:text-sm   justify-between px-16 p-4 mt-3 xmd:p-3 xmd:px-10">
      <Logo />
      <NavbarList />
      <Button className="bg-transparent hover:bg-transparent font-extrabold md:hidden">
        Get Started
      </Button>
      <Hamburger />
    </nav>
  );
}
