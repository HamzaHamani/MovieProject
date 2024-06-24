"use client";
import usePage from "@/hooks/usePage";
import { TsearchMovie } from "@/types/api";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

type Props = {
  data: TsearchMovie;
};

export default function ArrowButtons({ data }: Props) {
  const { page, nextPage, prevPage } = usePage();

  //TODO THE NAVIGATION IS WORKING, NOW U JUST GOTTA FORWARD THE DATA TO THE ACTION IDK HOW TBH HHHHHHH
  return (
    <>
      {" "}
      <button
        disabled={page == 1}
        className={`${page === 1 ? "bg-[#675720]" : "bg-yellow-500"} cursor-pointe p-2`}
        onClick={prevPage}
      >
        <ArrowLeftToLine />
      </button>
      <button
        className={`cursor-pointer p-2 ${page?.toString() === data.total_pages.toString() ? "bg-[#675720]" : "bg-yellow-500"}`}
        onClick={nextPage}
        disabled={page?.toString() === data.total_pages.toString()}
      >
        <ArrowRightToLine />
      </button>
    </>
  );
}
