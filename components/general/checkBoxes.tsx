import { bookmarksSchema } from "@/types";
import React from "react";
import { z } from "zod";

type bookSchemaType = z.infer<typeof bookmarksSchema>;
type Props = {
  data: bookSchemaType[];
};

export default function CheckBoxes({ data }: Props) {
  return data.map((item) => (
    <fieldset key={item.id}>
      <legend className="sr-only">Checkboxes</legend>

      <div className="group space-y-2">
        <label
          htmlFor="Option1"
          className="flex w-96 cursor-pointer items-start gap-4 rounded-lg border border-gray-200 p-4 transition hover:bg-indigo-100 peer-checked:bg-indigo-100"
        >
          <div className="flex items-center">
            &#8203;
            <input
              type="checkbox"
              className="peer size-4 rounded border-gray-300"
              id="Option1"
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
      </div>
    </fieldset>
  ));
}
