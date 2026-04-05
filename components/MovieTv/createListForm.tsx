"use client";
import { Button } from "../ui/button";

import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "../ui/input";
import { CreateBookmark, getFriendsForCurrentUser } from "@/lib/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import SmallLoadingIndicator from "../general/smallLoadingIndicator";
import {
  showSuccessNotification,
  showErrorNotification,
} from "@/components/notificationSystem";

type FriendUser = Awaited<ReturnType<typeof getFriendsForCurrentUser>>[number];

type Inputs = {
  name: string;
  description: string;
};

export default function CreateListForm({
  userId,
  setShowForm,
}: {
  userId: string | number;
  setShowForm: any;
}) {
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(
    [],
  );
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    void getFriendsForCurrentUser()
      .then(setFriends)
      .catch(() => setFriends([]));
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      const values = {
        bookmarkName: data.name,
        userId: String(userId),
        description: data.description,
      };

      const created = await CreateBookmark(values);

      if (created?.id && selectedCollaborators.length > 0) {
        await Promise.all(
          selectedCollaborators.map((userId) =>
            fetch("/api/collaborators/manage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "invite",
                bookmarkId: created.id,
                invitedUserId: userId,
              }),
            }),
          ),
        );
      }

      showSuccessNotification("Success", "List created successfully");
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      setShowForm((value: any) => !value);
    } catch (e) {
      console.log(userId);
      console.log(e);

      if (!userId)
        showErrorNotification(
          "Error",
          "You need to be logged in to create a list",
        );
      else
        showErrorNotification(
          "Error",
          "We encountered an error, please try again",
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-3 flex w-full flex-col gap-3 text-black"
    >
      <p className="text-xs uppercase tracking-wide text-gray-400">
        Create new list
      </p>

      <div className="mb-2 flex flex-col gap-1">
        <Input
          type="text"
          id="text"
          placeholder="List name"
          className="border-white/20 bg-white/5 text-textMain placeholder:text-gray-400"
          {...register("name", { required: "Name is required" })}
        />

        {errors.name && (
          <span className="text-sm font-light text-red-500">
            {errors.name.message}
          </span>
        )}
      </div>

      <div className="mb-2 flex flex-col gap-1">
        <Input
          type="text"
          id="text"
          placeholder="Short description"
          className="border-white/20 bg-white/5 text-textMain placeholder:text-gray-400"
          {...register("description", {
            required: "Description is required",
            minLength: {
              value: 10,
              message: "must be at least 10 charachters",
            },
          })}
        />

        {errors.description && (
          <span className="text-sm font-light text-red-500">
            {errors.description.message}
          </span>
        )}
      </div>

      <div className="mb-2 flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Invite collaborators (friends)
        </p>
        {friends.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-400">
            No friends available to invite yet.
          </p>
        ) : (
          <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-2 text-textMain">
            {friends.map((friend) => {
              const selected = selectedCollaborators.includes(friend.id);
              return (
                <label
                  key={friend.id}
                  className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/[0.04]"
                >
                  <span className="text-sm text-gray-200">
                    {friend.name ?? friend.username ?? "User"}
                    {friend.username ? (
                      <span className="ml-1 text-xs text-gray-400">
                        @{friend.username}
                      </span>
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedCollaborators((prev) => [
                          ...prev,
                          friend.id,
                        ]);
                      } else {
                        setSelectedCollaborators((prev) =>
                          prev.filter((id) => id !== friend.id),
                        );
                      }
                    }}
                  />
                </label>
              );
            })}
          </div>
        )}
      </div>

      <Button
        type="submit"
        className={`bg-primaryM-500 text-black hover:bg-primaryM-600 ${loading ? "cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? <SmallLoadingIndicator /> : "Create"}
      </Button>
    </form>
  );
}
