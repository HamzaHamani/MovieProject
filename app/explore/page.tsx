import { CarouselExplore } from "@/components/explore/carouselExplore";
import Image from "next/image";

type Props = {};

export default function Explore({}: Props) {
  return (
    <div className="h-[100vh] ">
      <div className="w-full h-[92.7vh] absolute top-0 -z-10 opacity-70 object-cover">
        <img
          src="https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg"
          // width={1920}
          // height={1080}
          className="object-cover" // necessary
          alt="image of a movie"
        />
      </div>

      <div className=" h-[90vh] flex flex-col justify-between">
        <div></div>
        <CarouselExplore />
      </div>
    </div>
  );
}
