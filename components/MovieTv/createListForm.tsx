import { bookmarksSchema } from "@/types";
import { Button } from "../ui/button";

import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";

type Inputs = {
  name: string;
  description: string;
};

export default function CreateListForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(bookmarksSchema) });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
  };

  console.log(watch("name")); // watch input value by passing the name of it

  // TODO USES SHADCN SCHEMA, WORK ON IT IN HOME PAGE TO SHOW CHANGES AUTOMAITCLY WITHOUT EACHTIME CLICKING  ON ADD LIST BUTTON
  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-2 text-black"
    >
      {/* register your input into the hook by invoking the "register" function */}
      <input
        defaultValue="test"
        {...register("name")}
        className="bg-none px-4 py-7"
      />

      {/* include validation with required or other standard HTML validation rules */}
      <input {...register("description", { required: true })} />
      {/* errors will return when field validation fails  */}
      {errors.name && <span>This field is required</span>}

      <Button
        type="submit"
        className="bg-indigo-400 text-white hover:bg-indigo-600"
      >
        Submit
      </Button>
    </form>
  );
}
