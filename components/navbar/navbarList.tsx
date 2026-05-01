"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  links: { href: string; label: string }[];
};

export default function NavbarList({ links }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <ul className="flex items-center gap-7 font-light md:hidden">
      {links.map((elm) => (
        <Link
          href={elm.href}
          key={elm.href}
          className={`cursor-pointer ${
            isActive(elm.href) ? "text-gray-100" : "text-gray-200"
          } font-medium`}
        >
          {elm.label}
        </Link>
      ))}
    </ul>
  );
}
