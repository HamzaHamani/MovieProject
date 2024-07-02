import { TspecifiedMovie } from "@/types/api";
import React from "react";
import Cast from "./cast";

type Props = {
  response: any;
  typeM: "movie" | "tv";
};

export default function StoryCast({ response, typeM }: Props) {
  return (
    <div className="">
      <div className="mb-10 flex flex-col gap-4">
        <h3 className="text-4xl font-medium text-white xl:text-2xl">
          Story Line
        </h3>
        <p className="w-[50%] text-lg text-gray-300 xl:w-full xl:text-base xmd:w-[100%] xmd:text-sm md:text-sm">
          {response.overview}{" "}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="mb-4 text-3xl font-medium xl:text-2xl">Top Cast</h3>
        <div className="bg-ed-200">
          <Cast typeM={typeM} id={response.id} />
        </div>
      </div>
    </div>
  );
}
