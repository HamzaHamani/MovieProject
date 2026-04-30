import { bookmarksSchema } from "@/types";
import React from "react";
import { z } from "zod";
import { AddMovie, RemoveMovie } from "@/lib/actions";
import { showProfileMovieToast } from "@/components/profile/profileToasts";
import { Separator } from "../ui/separator";
import { Check } from "lucide-react";

type bookSchemaType = z.infer<typeof bookmarksSchema>;
type Props = {
  data: bookSchemaType[];
  movieId: any;
  itemTitle: string;
  itemPosterPath: string | null;
  showForm: any;
  MoiveListsData: any;
};

export default function CheckBoxes({
  movieId,
  itemTitle,
  itemPosterPath,
  data,
  showForm,
  MoiveListsData,
}: Props) {
  const bookmarkIds = MoiveListsData?.map((item: any) => item.bookmarkId) || [];
  const [selectedLists, setSelectedLists] =
    React.useState<(string | number)[]>(bookmarkIds);
  const [loadingIds, setLoadingIds] = React.useState<Record<string, boolean>>(
    {},
  );

  React.useEffect(() => {
    setSelectedLists(bookmarkIds);
  }, [movieId, JSON.stringify(bookmarkIds)]);

  const handleSelect = async (listId: string | number) => {
    const listKey = String(listId);

    if (loadingIds[listKey]) return;

    const isSelected = selectedLists.includes(listId);
    const nextSelected = isSelected
      ? selectedLists.filter((id) => id !== listId)
      : [...selectedLists, listId];

    setSelectedLists(nextSelected);
    setLoadingIds((prev) => ({ ...prev, [listKey]: true }));

    try {
      const selectedList = data.find((item) => item.id === listId);
      const selectedListName = selectedList?.bookmarkName ?? "your list";

      if (isSelected) {
        const res = await RemoveMovie({
          bookmarkId: listKey,
          movieId,
        });

        if (!res?.removed) {
          setSelectedLists((prev) => [...prev, listId]);
          return;
        }

        showProfileMovieToast({
          title: itemTitle,
          message: `Removed from ${selectedListName}`,
          posterPath: itemPosterPath,
        });
      } else {
        const res = await AddMovie({
          bookmarkId: listKey,
          review: "",
          movieId,
        });

        if (res?.already) {
          showProfileMovieToast({
            title: itemTitle,
            message: `Already in ${selectedListName}`,
            posterPath: itemPosterPath,
          });
        } else {
          showProfileMovieToast({
            title: itemTitle,
            message: `Added to ${selectedListName}`,
            posterPath: itemPosterPath,
          });
        }
      }

      // keep the DB-backed list cache fresh for the current title and bookmark overview
      // without requiring a manual submit action.
      if (!isSelected) {
        // removal path already handled above
      }
    } catch (e) {
      setSelectedLists((prev) =>
        isSelected ? [...prev, listId] : prev.filter((id) => id !== listId),
      );
      showProfileMovieToast({
        title: "Error",
        message: "Couldn't update your list",
        posterPath: null,
      });
    } finally {
      setLoadingIds((prev) => {
        const next = { ...prev };
        delete next[listKey];
        return next;
      });
    }
  };

  return (
    <div>
      <div className="hide-scrollbar max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {data.map((item, num) => (
          <div className="group" key={item.id}>
            <label
              htmlFor={`Option${num}`}
              className={`mb-2 flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                selectedLists.includes(item.id)
                  ? "border-primaryM-500/50 bg-primaryM-500/10"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div className="mt-0.5 flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  id={`Option${num}`}
                  checked={selectedLists.includes(item.id)}
                  onChange={() => void handleSelect(item.id)}
                />
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                    selectedLists.includes(item.id)
                      ? "border-primaryM-500 bg-primaryM-500 text-black"
                      : "border-white/30 bg-transparent text-transparent"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <strong className="truncate text-base font-semibold text-gray-100">
                    {item.bookmarkName}
                  </strong>
                </div>
                {item.description ? (
                  <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                    {item.description}
                  </p>
                ) : null}
                {selectedLists.includes(item.id) &&
                  bookmarkIds.includes(item.id) && (
                    <p className="mt-2 text-xs font-medium text-primaryM-500">
                      Already added
                    </p>
                  )}
              </div>
            </label>
            <Separator className="my-3 bg-gray-300/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
