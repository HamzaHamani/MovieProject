"use client";
import { Bookmark, CirclePlus } from "lucide-react";
import { Button } from "../../ui/button";
import { AddMovie, CreateBookmark, getBookmarks, getUser } from "@/lib/actions";
import { toast } from "sonner";

type Props = {
  shwoId: string | number;
  typeM?: "movie" | "tv";
};

export default function LogTheMT({ shwoId, typeM }: Props) {
  async function handleClick(e: any) {
    const user = await getUser();
    const id: string = user?.id as string;
  }

  return (
    <form action={handleClick}>
      <Button
        className="flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600 xsmd:text-xs"
        type="submit"
      >
        {" "}
        <span className="xsmd:text-xs">
          <CirclePlus />
        </span>
        Log The {typeM === "movie" ? "Movie" : "Tv Show"}
      </Button>
    </form>
  );
}
