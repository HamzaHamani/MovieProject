import { bookmarksSchema } from "@/types";
import React from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { AddMovie } from "@/lib/actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import SmallLoadingIndicator from "./smallLoadingIndicator";
import { Separator } from "../ui/separator";
import { Check } from "lucide-react";

type bookSchemaType = z.infer<typeof bookmarksSchema>;
type Props = {
  data: bookSchemaType[];
  movieId: any;
  itemTitle: string;
  itemPosterPath: string | null;
  setSelectedLists: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  showForm: any;
  selectedLists: (string | number)[];
  MoiveListsData: any;
};

export default function CheckBoxes({
  movieId,
  itemTitle,
  itemPosterPath,
  data,
  setSelectedLists,
  showForm,
  selectedLists,
  MoiveListsData,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const queryClient = useQueryClient();
  const handleSelect = (userId: string | number) => {
    setSelectedLists((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };
  async function handleSubmit(e: any) {
    console.log("submit");
    e.preventDefault();
    // HANDLING ADDING MOVIES TO LIST FOR ONE INSERT
    if (selectedLists.length == 1) {
      try {
        setLoading(true);
        const selectedList = data.find((item) => item.id === selectedLists[0]);
        const selectedListName = selectedList?.bookmarkName ?? "your list";

        const res = await AddMovie({
          bookmarkId: selectedLists[0] as string,
          review: "",
          movieId: movieId,
        });
        if (res?.already) {
          toast.custom(
            () => (
              <div className="flex w-[330px] items-center gap-3 rounded-xl border border-white/20 bg-[#f2f2f2] p-2 text-black shadow-lg">
                <div className="h-12 w-12 overflow-hidden rounded-md bg-black/10">
                  {itemPosterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185/${itemPosterPath}`}
                      alt={itemTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-black/60">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{itemTitle}</p>
                  <p className="truncate text-xs text-black/75">
                    Already in '{selectedListName}'
                  </p>
                </div>
              </div>
            ),
            { position: "bottom-left", duration: 3500 },
          );
          return;
        } else if (!res?.already) {
          queryClient.invalidateQueries({
            queryKey: ["movieLists", "bookmarks"],
          });
          toast.custom(
            () => (
              <div className="flex w-[330px] items-center gap-3 rounded-xl border border-white/20 bg-[#f2f2f2] p-2 text-black shadow-lg">
                <div className="h-12 w-12 overflow-hidden rounded-md bg-black/10">
                  {itemPosterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185/${itemPosterPath}`}
                      alt={itemTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-black/60">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{itemTitle}</p>
                  <p className="truncate text-xs text-black/75">
                    Added to '{selectedListName}'
                  </p>
                </div>
              </div>
            ),
            { position: "bottom-left", duration: 3500 },
          );
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
      <div className="hide-scrollbar max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {data.map((item, num) => (
          <div className="group" key={item.id}>
            <label
              htmlFor={`Option${num}`}
              className={`mb-2 flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                bookmarkIds.includes(item.id)
                  ? "border-primaryM-500/50 bg-primaryM-500/10"
                  : selectedLists.includes(item.id)
                    ? "border-primaryM-500/60 bg-primaryM-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
              }`}
            >
              <div className="mt-0.5 flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  id={`Option${num}`}
                  checked={bookmarkIds.includes(item.id)}
                  disabled={bookmarkIds.includes(item.id)}
                  onChange={() => handleSelect(item.id)}
                />
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                    bookmarkIds.includes(item.id) ||
                    selectedLists.includes(item.id)
                      ? "border-primaryM-500 bg-primaryM-500 text-black"
                      : "border-white/30 bg-transparent text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <strong className="font-medium text-gray-100">
                  {item.bookmarkName}
                </strong>

                <p className="mt-1 break-words text-sm text-gray-400">
                  {item.description}
                </p>
                {bookmarkIds.includes(item.id) && (
                  <p className="mt-2 text-xs font-medium text-primaryM-500">
                    Already added
                  </p>
                )}
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
          className={`mt-4 flex w-full items-center justify-center bg-primaryM-500 text-black hover:bg-primaryM-600 ${loading ? "cursor-not-allowed" : ""} `}
        >
          {loading ? <SmallLoadingIndicator /> : "Add To Selected List"}
        </Button>
      )}
    </form>
  );
}
