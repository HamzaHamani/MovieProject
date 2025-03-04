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
      <DropdownMenuContent className="w-56 border-gray-500 bg-backgroundM text-textMain">
        <DropdownMenuLabel>{userT.name}</DropdownMenuLabel>
        <DropdownMenuLabel className="text-xs font-normal text-gray-400">
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
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
