"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  LogOut,
  MessageSquareQuote,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { usersSchema } from "@/types/index";
import { z } from "zod";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/notificationSystem";

type userSchema = z.infer<typeof usersSchema>;

type Props = { user: userSchema };

export function UserDropDown({ user }: Props) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const profileHref = user.username ? `/profile/${user.username}` : "/profile";
  const reviewsHref = user.username
    ? `/profile/${user.username}#reviews`
    : "/profile";

  const handleSignOut = async () => {
    try {
      const result = await signOut({
        redirect: false,
        callbackUrl: "/sign-in",
      });

      showSuccessNotification(
        "Signed Out",
        "You have been logged out successfully",
      );

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      showErrorNotification(
        "Logout Failed",
        "Could not sign out. Please try again",
      );
    }
  };

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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:bg-white/10"
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
      <DropdownMenuContent className="w-[20rem] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.12),transparent_40%),linear-gradient(180deg,rgba(12,12,12,0.98)_0%,rgba(8,8,8,0.98)_100%)] p-0 text-textMain shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <div className="p-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-1 ring-white/10">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="bg-white/10 text-xs text-white">
                  {user.name?.slice(0, 2)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name ?? "Profile"}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {user.username
                    ? `@${user.username}`
                    : user.email ?? "No email linked"}
                </p>
              </div>
            </div>

            <Button
              asChild
              className="mt-3 h-8 w-full rounded-full bg-primaryM-500 text-black hover:bg-primaryM-600"
            >
              <Link href={profileHref}>
                <span>Open profile</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuGroup className="px-2 pb-2">
          <DropdownMenuItem
            asChild
            className="rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06]"
          >
            <Link href={reviewsHref}>
              <MessageSquareQuote className="mr-2 h-4 w-4 text-primaryM-500" />
              <span>Your Reviews</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06]"
          >
            <Link href="/bookmarks">
              <CreditCard className="mr-2 h-4 w-4 text-primaryM-500" />
              <span>Your Lists</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/10" />

        <div className="px-2 pb-2">
          <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-1.5">
            <DropdownMenuItem
              onClick={handleSignOut}
              className="rounded-lg px-3 py-2.5 text-sm text-red-300 outline-none transition hover:bg-red-500/10 hover:text-red-200 focus:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
