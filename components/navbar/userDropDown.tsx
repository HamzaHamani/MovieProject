import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarIcon from "./avatarIcon";
import { usersSchema } from "@/types/index";
import { z } from "zod";
import SignOutButton from "../SignOut";

type userSchema = z.infer<typeof usersSchema>;

type Props = { user: userSchema };
export function UserDropDown({ user }: any) {
  let userT: userSchema = user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AvatarIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-backgroundM text-textMain border-gray-500">
        <DropdownMenuLabel>{userT.name}</DropdownMenuLabel>
        <DropdownMenuLabel className="text-gray-400 font-normal text-xs">
          {userT.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-500" />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-500" />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
