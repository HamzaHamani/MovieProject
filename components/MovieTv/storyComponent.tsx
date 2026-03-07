import React from "react";

type Props = {
  response: any;
  typeM: "movie" | "tv";
};

export default function Story({ response, typeM }: Props) {
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
    </div>
  );
}
