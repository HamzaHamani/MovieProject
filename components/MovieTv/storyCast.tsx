import { TspecifiedMovie } from "@/types/api";
import React from "react";

type Props = {
  response: TspecifiedMovie;
};

export default function StoryCast({ response }: Props) {
  return (
    <div className="">
      <div className="mb-5 flex flex-col gap-4">
        <h3 className="text-2xl font-medium">Story Line</h3>
        <p className="w-[50%] text-gray-300">{response.overview} </p>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-medium">Top Cast</h3>
        <div className="flex gap-5">
          <div className="h-16 w-16 rounded-full bg-white"></div>
          <div className="flex flex-col justify-center">
            <h3 className="text-xl">John Doe</h3>
            <h4 className="text-sm text-gray-200">Adam smith</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
