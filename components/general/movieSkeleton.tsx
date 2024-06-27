import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function MovieSkeleton({}: Props) {
  return (
    <div>
      <Skeleton className="after-img group relative h-[550px] w-[400px] cursor-pointer self-center overflow-hidden rounded bg-gray-200 bg-textMain/60 xl:h-[430px] xl:w-[310px] lg:w-[290px] h1text8:h-[400px] h1text8:w-[250px] xsmd:h-[300px] xsmd:w-[200px] smd:h-[350px] smd:w-[250px]" />
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
