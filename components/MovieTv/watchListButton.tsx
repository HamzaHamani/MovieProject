"use client";
import { Bookmark } from "lucide-react";
import { Button } from "../ui/button";
import { AddMovie, CreateBookmark, getBookmarks, getUser } from "@/lib/actions";
import { toast } from "sonner";

type Props = {
  shwoId: string | number;
};

export default function WatchListButton({ shwoId }: Props) {
  async function handleClick(e: any) {
    const user = await getUser();
    const id: string = user?.id as string;

    if (!user) {
      toast.error("Please login to add to watchlist");
      return;
    }
    try {
      const bookmark = await getBookmarks(id);

      // check if watchlist exists, if not create it and add the movie
      if (!bookmark.map((item) => item.bookmarkName).includes("watchlist")) {
        // creating watchlist if not existed
        const data = {
          userId: id,
          bookmarkName: "watchlist",
          description: "Movies and Tv shows you want to watch",
        };

        const bookmardId = await CreateBookmark(data);

        // adding movie to watchlist aftrer creating it
        const movieData = {
          bookmarkId: bookmardId.id,
          movieId: shwoId,
          review: "",
        };

        await AddMovie(movieData);
        toast.success("Added to watchlist");
        return;
      }

      //TODO handling if movie exsit first dont add it , add the function where u get bookmarks in line 22
      // if watchlist exists, add the movie to it
      const watchlist = bookmark.filter(
        (item) => item.bookmarkName === "watchlist",
      );
      const watchlistBookmark = watchlist[0]; // Assuming there's only one watchlist
      const movieData = {
        bookmarkId: watchlistBookmark.id,
        movieId: shwoId,
        review: "",
      };
      await AddMovie(movieData);
      toast.success("Added to watchlist");
      console.log("watchlist", watchlist);
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
