"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import MenuAnimation from "@/components/animata/list/menu-animation";
import { SheetClose } from "@/components/ui/sheet";

type MenuItem = {
  label: string;
  href: string;
};

type Props = {
  items: MenuItem[];
};

export default function HamburgerMenuItems({ items }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <SheetClose asChild key={item.href}>
            <Link href={item.href} className="relative">
              <div className="flex items-center justify-between">
                <MenuAnimation menuItems={[item]} />
                {active && (
                  <ChevronRight className="absolute right-0 h-5 w-5 text-primaryM-500" />
                )}
              </div>
            </Link>
          </SheetClose>
        );
      })}
    </div>
  );
}
