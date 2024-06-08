"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {};

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/saved", label: "Saved" },
  { href: "/search", label: "Search" },
];

export default function NavbarList({}: Props) {
  const pathname = usePathname();
  return (
    <ul className="flex gap-7 font-light  items-center">
      {links.map((elm) => (
        <Link
          href={elm.href}
          key={elm.href}
          className={`cursor-pointer ${
            elm.href == pathname ? "text-gray-100" : "text-gray-200"
          }`}
        >
          {elm.label}
        </Link>
      ))}
    </ul>
  );
}
