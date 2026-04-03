"use client";
import { Button } from "../ui/button";

import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "../ui/input";
import { CreateBookmark } from "@/lib/actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import SmallLoadingIndicator from "../general/smallLoadingIndicator";

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
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      const values = {
        bookmarkName: data.name,
        userId: String(userId),
        description: data.description,
      };

      await CreateBookmark(values);
      toast.success("List created successfully");
      queryClient.invalidateQueries({ queryKey: ["bookmarks", userId] });
      setShowForm((value: any) => !value);
    } catch (e) {
      console.log(userId);
      console.log(e);

      if (!userId) toast.error("You need to be logged in to create a list");
      else toast.error("We econtered an error, please try again");
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
