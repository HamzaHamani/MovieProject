"use client";
import { Share2 } from "lucide-react";
import { Button } from "../../ui/button";
import { toast } from "sonner";

type Props = {
  typeSearch: "Movie" | "Tv";
};

export default function ShareButton({ typeSearch }: Props) {
  const copyUrlToClipboard = () => {
    console.log("1");

    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast.success(`${typeSearch} Link Copied in your Clipboard`);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  };
  return (
    <Button
      variant={"outline"}
      className="hidden items-center gap-2 bg-transparent sss:flex"
      onClick={copyUrlToClipboard}
    >
      <span>
        <Share2 />
      </span>{" "}
      <span className="sss:hidden">Add List</span>
    </Button>
  );
}
