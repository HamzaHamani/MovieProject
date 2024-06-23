import { SearchVanishComp } from "@/components/search/searchVanishComp";

type Props = {};

export default function Search({}: Props) {
  return (
    <div className="flex flex-col items-center  bg-gray-0 h-[91.5vh]">
      <div className="text-[160px] tracking-tighter mx-auto flex flex-col xl:text-[130px] lg:text-[90px] md:text-[70px] sm:text-[50px] s:text-[40px] xs:text-[30px]  text-center bg-red-0 w-[100wh] mt-20">
        <h1 className="uppercase h1text:text-[125px] font-extrabold text-center textGradient h1text2:text-[150px] h1text3:text-[140px] xl:text-[30px] h1text4:text-[133px] h1text5:text-[125px] h1text6:text-[110px] h1text7:text-[100px] lg:text-[90px] xmd:text-[75px] h1text8:text-[80px] xsmd:text-[69px] md:text-[63px] s:text-[40px] smd:text-[58px] ss:text-[53px] sss:text-[46px] xs:text-[28px]">
          Discover Your Next
        </h1>
        <p className="uppercase font-extrabold text-center -mt-28 xl:-mt-24 lg:-mt-16 sm:-mt-8 s:-mt-6 xs:-mt-4 textGradient h1text2:text-[145px] h1text3:-mt-28 h1text4:text-[130px] h1text4:-mt-24 h1text5:text-[120px] h1text5:-mt-20 h1text6:text-[105px] h1text6:-mt-16 h1text7:text-[95px] lg:text-[90px] h1text8:text-[77px] h1text8:-mt-12 xsmd:text-[65px] md:text-[57px]  md:-mt-10 s:text-[40px] smd:text-[55px] ss:text-[50px] sss:text-[45px] xs:text-[27px]">
          favorite movie or
        </p>
        <p className="uppercase font-extrabold text-center -mt-28 xl:-mt-24 lg:-mt-16 sm:-mt-8 s:-mt-6 xs:-mt-4 textGradient  h1text3:-mt-28 h1text4:text-[130px] h1text4:-mt-24 h1text5:text-[120px] h1text5:-mt-20 h1text6:text-[105px] h1text6:-mt-16 h1text7:text-[95px] lg:text-[90px] h1text8:text-[77px] h1text8:-mt-12 xsmd:text-[65px]  md:text-[57px]  md:-mt-10 s:text-[40px] smd:text-[55px] sss:text-[45px] xs:text-[27px]">
          tv show here
        </p>
      </div>
      <div className="mt-20">
        <SearchVanishComp />
      </div>
    </div>
  );
}
