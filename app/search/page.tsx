import { SearchVanishComp } from "@/components/search/searchVanishComp";

type Props = {};

export default function Search({}: Props) {
  return (
    <div>
      <div className=" mx-auto flex flex-col  ">
        <h1 className="text-[170px] uppercase tracking-tighter font-extrabold text-center">
          Discover Your Next
        </h1>
        <p className="text-[170px] uppercase tracking-tighter font-extrabold text-center -mt-28">
          favorite movie or
        </p>
        <p className="text-[170px] uppercase tracking-tighter font-extrabold text-center -mt-28">
          tv show here
        </p>
      </div>
      <div>
        <SearchVanishComp />
      </div>
    </div>
  );
}
