import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TvideoApiSchema } from "@/types/video";

type Props = {
  res: TvideoApiSchema;
};
export function CarouselComponent({ res }: Props) {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {res.results.map((video, index) => (
          <CarouselItem
            key={index}
            className="-ml-0 flex basis-1/6 items-center justify-center xds:basis-1/5 Ctex6:basis-1/4 h1text8:basis-1/3 ss:basis-1/2 s:basis-52"
          >
            <div key={video.id} className="flex flex-col gap-2">
              <div>
                <iframe
                  width="448"
                  height="252"
                  src={`https://www.youtube.com/embed/${video.key}?modestbranding=1&rel=0&iv_load_policy=3`}
                  title={video.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h3>
                {(() => {
                  const name = video.name;
                  return name.length > 48 ? name.slice(0, 48) + "..." : name;
                })()}
              </h3>
              <div className="flex gap-2">
                <Badge className="bg-slate-50 text-backgroundM">
                  {video.type}
                </Badge>
                <span className="text-muted-foreground">|</span>
                <p>
                  {new Date(video.published_at).getFullYear()}-
                  {(new Date(video.published_at).getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}
                  -
                  {new Date(video.published_at)
                    .getDate()
                    .toString()
                    .padStart(2, "0")}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute -bottom-10 right-0 mt-5 flex gap-2">
        <CarouselPrevious className="h1tex:hidden" />
        <CarouselNext className="h1tex:hidden" />
      </div>
    </Carousel>
  );
}
