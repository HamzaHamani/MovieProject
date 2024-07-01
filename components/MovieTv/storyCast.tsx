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
      <div className="mb-5 flex flex-col gap-4">
        <h3 className="text-2xl font-medium">Story Line</h3>
        <p className="w-[50%] text-gray-300">{response.overview} </p>
      </div>
      <Cast typeM={typeM} id={response.id} />
    </div>
  );
}
