"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersSchema } from "@/types/index";
import { z } from "zod";
import SignOutButton from "../SignOut";

type userSchema = z.infer<typeof usersSchema>;

type Props = { user: userSchema };

export function UserDropDown({ user }: Props) {
  const [mounted, setMounted] = useState(false);
  const profileHref = user.username ? `/profile/${user.username}` : "/profile";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5"
        aria-label="User menu"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="bg-white/10 text-xs text-textMain">
            {user.name?.slice(0, 2)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5"
          aria-label="User menu"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-white/10 text-xs text-textMain">
              {user.name?.slice(0, 2)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-gray-500 bg-backgroundM text-textMain">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuLabel className="text-xs font-normal text-gray-400">
          {user.email ?? "No email linked"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-500" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={profileHref}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-500" />
        <DropdownMenuItem>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
