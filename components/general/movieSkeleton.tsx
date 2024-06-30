import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function MovieSkeleton({}: Props) {
  return (
    <div>
      <Skeleton className="xxds:w-[350px] xds:w-[330px] xlx:w-[350px] xxxl:w-[370px] xds:h-[500px] after-img xssmd:w-[330px] xssmd:h-[500px] xsmd:w-[300px]smd:h-[350px] group relative h-[550px] w-[400px] cursor-pointer self-center overflow-hidden rounded bg-gray-200 bg-textMain/60 xl:h-[430px] xl:w-[310px] lg:w-[290px] h1text8:h-[400px] h1text8:w-[250px] xsmd:h-[450px] smd:w-[250px] sss:h-[330px] sss:w-[210px] s:h-[370px] s:w-[230px]" />
      <div className="flex h-[100px] flex-col justify-between gap-2 py-2">
        <div>
          <Skeleton className="h-7 w-[90%] bg-gray-300" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-16 bg-gray-300" />
          </div>
          <div>
            {" "}
            <Skeleton className="h-5 w-16 bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
