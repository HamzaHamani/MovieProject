import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Bookmarks",
};
export default function Saved({}) {
  return (
    <div>
      <div className="container mt-5">
        <h2 className="mb-5 text-6xl font-semibold">Your Lists</h2>

        <Separator className="bg-textMain" />
      </div>
    </div>
  );
}
