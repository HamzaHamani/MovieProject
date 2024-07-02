"use client";
import { Bookmark } from "lucide-react";
import { Button } from "../ui/button";
import { getBookmarks, getUser } from "@/lib/actions";
import { toast } from "sonner";

type Props = {};

export default function WatchListButton({}: Props) {
  //   async function useUser() {
  //     const user = await getUser();
  //   }
  //   const handleClick = async (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();
  //     console.log("sent");
  //     if (!user) {
  //       console.log("not logged in");
  //       return;
  //     }
  //   };

  async function handleClick(e: any) {
    const user = await getUser();
    const id: string = user?.id as string;

    if (!user) {
      toast.error("Please login to add to watchlist");
      return;
    }
    try {
      const bookmark = await getBookmarks(id);
      //TODO CHECK IF THERE IS NO BOOKMAKR, IF NOT CREATE ONE AND ADDED IT
      //TODO CHANGES TABLE NAMES FOR BOOKMARKS TO SOMETHING LIKE LIST AND OTHER TABLES
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <form action={handleClick}>
      <Button
        className="flex items-center gap-2 bg-primaryM-500 text-black hover:bg-primaryM-600 xsmd:text-xs"
        type="submit"
      >
        {" "}
        <span className="xsmd:text-xs">
          <Bookmark />
        </span>
        Add Watchlist
      </Button>
    </form>
  );
}
