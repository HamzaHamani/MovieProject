import { bookmarksSchema } from "@/types";
import React from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { create } from "domain";
import { AddMovie, CreateBookmark, getMovieLists } from "@/lib/actions";
import { bookmarksMovies } from "@/db/schema";
import { db } from "@/db";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SmallLoadingIndicator from "./smallLoadingIndicator";
import { Separator } from "../ui/separator";

type bookSchemaType = z.infer<typeof bookmarksSchema>;
type Props = {
  data: bookSchemaType[];
  movieId: any;
  setSelectedLists: React.Dispatch<React.SetStateAction<string | number[]>>;
  showForm: any;
  selectedLists: string | number[];
  MoiveListsData: any;
};

export default function CheckBoxes({
  movieId,
  data,
  setSelectedLists,
  showForm,
  selectedLists,
  MoiveListsData,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const queryClient = useQueryClient();
  const handleSelect = (userId: any) => {
    setSelectedLists((prev) => {
      if (prev === userId) {
        return [];
      }
      if (Array.isArray(prev)) {
        if (prev.includes(userId)) {
          return prev.filter((id) => id !== userId);
        }
        return [...prev, userId];
      }
      return [prev, userId];
    });
  };
  async function handleSubmit(e: any) {
    console.log("submit");
    e.preventDefault();
    // HANDLING ADDING MOVIES TO LIST FOR ONE INSERT
    if (selectedLists.length == 1) {
      try {
        setLoading(true);
        const res = await AddMovie({
          bookmarkId: selectedLists[0] as string,
          review: "",
          movieId: movieId,
        });
        if (res?.already) {
          toast.info("Already in your list");
          return;
        } else if (!res?.already) {
          queryClient.invalidateQueries({
            queryKey: ["movieLists", "bookmarks"],
          });
          toast.success("Added to your list");
        }
      } catch (e) {
        toast.error("we couldnt add it to your list");
      } finally {
        setLoading(false);
      }
      // HANDLING ADDING MOVIES TO LIST FOR MULTIPLE INSERT
    } else {
      console.log("we cant");
    }
  }
  const bookmarkIds = MoiveListsData?.map((item: any) => item.bookmarkId) || [];

  return (
    <form onSubmit={handleSubmit}>
      <div className="hide-scrollbar h-80 space-y-3 overflow-y-scroll">
        {data.map((item, num) => (
          <div className="group space-y-2" key={item.id}>
            <label
              htmlFor={`Option${num}`}
              className="mb-3 flex w-96 cursor-pointer items-start gap-4 rounded-lg p-4 transition hover:bg-indigo-100 peer-checked:bg-indigo-100"
            >
              <div className="flex items-center">
                &#8203;
                <input
                  type="checkbox"
                  className="peer size-4 rounded border-gray-300"
                  id={`Option${num}`}
                  checked={bookmarkIds.includes(item.id)}
                  disabled={bookmarkIds.includes(item.id)}
                  onChange={() => handleSelect(item.id)}
                />
              </div>

              <div className="">
                <strong className="font-medium text-gray-100 group-hover:text-black peer-checked:text-black">
                  {item.bookmarkName}
                </strong>

                <p className="mt-1 text-sm text-gray-300 group-hover:text-gray-800 peer-checked:text-black">
                  {item.description}
                </p>
              </div>
            </label>
            <Separator className="my-4 bg-gray-300/50" />
          </div>
        ))}
      </div>
      {!showForm && data?.length !== 0 && (
        <Button
          type="submit"
          disabled={selectedLists.length === 0}
          className={`j mt-5 flex items-center justify-center bg-indigo-500 ${loading ? "cursor-not-allowed" : ""} `}
        >
          {loading ? <SmallLoadingIndicator /> : "Add"}
        </Button>
      )}
    </form>
  );
}
