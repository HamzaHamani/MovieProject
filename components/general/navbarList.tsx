"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
  links: { href: string; label: string }[];
};

export default function NavbarList({ links }: Props) {
  const pathname = usePathname();
  return (
    <ul className="flex gap-7 font-light  items-center md:hidden">
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
