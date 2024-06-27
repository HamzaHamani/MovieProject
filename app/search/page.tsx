import { SearchVanishComp } from "@/components/search/searchVanishComp";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
};
type Props = {};

export default function Search({}: Props) {
  return (
    <div className="bg-gray-0 flex h-[91.5vh] flex-col items-center">
      <div className="bg-red-0 mx-auto mt-14 flex w-[100wh] flex-col text-center text-[160px] tracking-tighter xl:text-[130px] lg:text-[90px] md:text-[70px] sm:text-[50px] s:text-[40px] xs:text-[30px]">
        <h1 className="textGradient text-center font-extrabold uppercase xl:text-[30px] h1text:text-[125px] h1text2:text-[150px] h1text3:text-[140px] h1text4:text-[133px] h1text5:text-[125px] h1text6:text-[110px] h1text7:text-[100px] lg:text-[90px] h1text8:text-[80px] xmd:text-[75px] xsmd:text-[69px] md:text-[63px] smd:text-[58px] ss:text-[53px] sss:text-[46px] s:text-[40px] h1text9:text-[33px] xss:text-[30px] xs:text-[28px]">
          Discover Your Next
        </h1>
        <p className="textGradient -mt-28 text-center font-extrabold uppercase xl:-mt-24 h1text2:text-[145px] h1text3:-mt-28 h1text4:-mt-24 h1text4:text-[130px] h1text5:-mt-20 h1text5:text-[120px] h1text6:-mt-16 h1text6:text-[105px] h1text7:text-[95px] lg:-mt-16 lg:text-[90px] h1text8:-mt-12 h1text8:text-[77px] xsmd:text-[65px] md:-mt-10 md:text-[57px] smd:text-[55px] sm:-mt-8 ss:text-[50px] sss:text-[45px] s:-mt-6 s:text-[40px] h1text9:-mt-4 h1text9:text-[30px] xss:-mt-4 xss:text-[30px] xs:-mt-4 xs:text-[27px]">
          favorite movie or
        </p>
        <p className="textGradient -mt-28 text-center font-extrabold uppercase xl:-mt-24 h1text3:-mt-28 h1text4:-mt-24 h1text4:text-[130px] h1text5:-mt-20 h1text5:text-[120px] h1text6:-mt-16 h1text6:text-[105px] h1text7:text-[95px] lg:-mt-16 lg:text-[90px] h1text8:-mt-12 h1text8:text-[77px] xsmd:text-[65px] md:-mt-10 md:text-[57px] smd:text-[55px] sm:-mt-8 sss:text-[45px] s:-mt-6 s:text-[40px] h1text9:-mt-4 h1text9:text-[30px] xss:-mt-4 xss:text-[30px] xs:-mt-4 xs:text-[27px]">
          tv show here
        </p>
      </div>
      <div className="mt-14">
        <SearchVanishComp />
      </div>
    </div>
  );
}
