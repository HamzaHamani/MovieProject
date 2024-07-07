import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getMoviesBook } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Bookmarks",
};
export default async function Saved({}) {
  const data = await getMoviesBook("2f97ccca-06f1-4d1c-b280-e37ebed9d7d7");

  return (
    <div>
      <div className="container mt-5">
        <h2 className="mb-5 text-6xl font-semibold">Your Lists</h2>

        <Separator className="bg-textMain" />
        {data.map((item) => {
          return <div key={item.movieId}>{item.movieId}</div>;
        })}
      </div>
    </div>
  );
}
