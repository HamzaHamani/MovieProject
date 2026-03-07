import { Skeleton } from "../../ui/skeleton";

type Props = {};

export default function CarouselTLoadingIndicator({}: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="">
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="aspect-[16/9] w-[330px] max-w-[45vw] flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 xds:w-[180px] lg:w-[130px] s:w-[380px] s:max-w-[95vw]" />

            <Skeleton className="h-4 w-[268px] bg-gray-50 xds:w-[180px] lg:w-[130px] s:w-[100px]" />
            <div className="flex gap-2">
              {" "}
              <Skeleton className="h-4 w-[80px] bg-gray-50 xds:w-[60px] lg:w-[50px] s:w-[50px]" />
              <span className="text-muted-foreground">|</span>
              <Skeleton className="h-4 w-[180px] bg-gray-50 xds:w-[140px] lg:w-[100px] s:w-[80px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
