import React from "react";
import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function VideoLoadingIndicator({}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-[252px] w-[448px] bg-gray-50" />

      <Skeleton className="h-4 w-[448px] bg-gray-50" />
      <div className="flex gap-2">
        {" "}
        <Skeleton className="h-4 w-[100px] bg-gray-50" />
        <span className="text-muted-foreground">|</span>
        <Skeleton className="h-4 w-[200px] bg-gray-50" />
      </div>
    </div>
  );
}
