"use client";
import { useSession } from "next-auth/react";

// import { bookmarksSchema } from "@/types";
import { Button } from "../ui/button";

// import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, SubmitHandler } from "react-hook-form";
// import { z } from "zod";
import { Input } from "../ui/input";
import { CreateBookmark } from "@/lib/actions";
import { toast } from "sonner";
// import { Label } from "../ui/label";

type Inputs = {
  name: string;
  description: string;
  id: string;
};

export default function CreateListForm({
  userId,
  setShowForm,
}: {
  userId: string | number;
  setShowForm: any;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const values = {
        bookmarkName: data.name,
        userId: data.id,
        description: data.description,
      };

      await CreateBookmark(values);
      toast.success("List created successfully");
      setShowForm((value: any) => !value);
    } catch (e) {
      console.log(e);
      toast.error("Errro");
    }
  };


  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="justify- items-cente flex flex-col gap-2 text-black"
    >
      <div className="mb-2 flex flex-col gap-1">
        <Input
          type="text"
          id="text"
          placeholder="Name"
          className="text-textMain"
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
          placeholder="Description"
          className="text-textMain"
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
      <input type="hidden" {...register("id")} value={userId} />

      <Button
        type="submit"
        className="bg-indigo-400 text-white hover:bg-indigo-600"
      >
        Create
      </Button>
    </form>
  );
}
