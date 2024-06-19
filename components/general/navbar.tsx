import React from "react";
import { Button } from "../ui/button";
import NavbarList from "./navbarList";
import Logo from "./logo";
import Hamburger from "../ui/Hamburger";
import Link from "next/link";
import { getUser } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/search", label: "Search" },
];

type Props = {};
export default async function Navbar({}: Props) {
  const user = await getUser();

  return (
    <nav className="flex w-[90%] mx-auto rounded-full bg-backgroundM text-text items-center  xmd:text-sm   justify-between px-16 p-4 mt-3 xmd:p-3 xmd:px-10">
      <Logo />
      <NavbarList links={links} />
      {user ? (
        <div>user</div>
      ) : (
        <Button className="bg-transparent hover:bg-transparent font-extrabold md:hidden">
          <Link href="/sign-in">Get Started</Link>
        </Button>
      )}

      <Hamburger />
    </nav>
  );
}
