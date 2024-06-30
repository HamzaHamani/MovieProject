import React from "react";
import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function VideoLoadingIndicator({}: Props) {
  return <Skeleton className="h-[315px] w-[560px] bg-gray-50" />;
}
