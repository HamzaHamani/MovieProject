"use client";
import { useSession } from "next-auth/react";

// import { bookmarksSchema } from "@/types";
import { Button } from "../ui/button";

// import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, SubmitHandler } from "react-hook-form";
// import { z } from "zod";
import { Input } from "../ui/input";
// import { Label } from "../ui/label";

type Inputs = {
  name: string;
  description: string;
  id: string | number;
};

export default function CreateListForm({
  userId,
}: {
  userId: string | number;
}) {
  console.log(userId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    try {
      console.log(data, "submited");
    } catch (e) {
      console.log(e);
    }
  };

  console.log(watch("description")); // watch input value by passing the name of it

  // TODO USES SHADCN SCHEMA, WORK ON IT IN HOME PAGE TO SHOW CHANGES AUTOMAITCLY WITHOUT EACHTIME CLICKING  ON ADD LIST BUTTON
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
      <input type="hidden" {...register("id")} value="1" />

      <Button
        type="submit"
        className="bg-indigo-400 text-white hover:bg-indigo-600"
      >
        Create
      </Button>
    </form>
  );
}
