import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getUser } from "@/lib/actions";

type Props = {};

export default async function AvatarIcon({}: Props) {
  const user = await getUser();

  return (
    <Avatar>
      {" "}
      <AvatarImage src={user?.image as string} />
      <AvatarFallback>{"Profile Avatar"}</AvatarFallback>
    </Avatar>
  );
}
