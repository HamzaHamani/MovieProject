import { TCreditsSchema } from "@/types/cast";

type Props = {
  res: TCreditsSchema;
};

export default function CastComponent({ res }: Props) {
  const popularCast = res.cast
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);
  console.log(popularCast);
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-2xl font-medium">Top Cast</h3>
      <div className="bg-ed-200 grid grid-cols-5 items-start justify-start gap-1">
        {popularCast.map((cast) => (
          <>
            {" "}
            <div className="bg-re-500 flex w-[300px] gap-2">
              <div className="h-[170px] w-[100px] bg-white">
                <img
                  src={`https://image.tmdb.org/t/p/w500/${cast.profile_path}`}
                  alt={cast.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-xl">{cast.name}</h3>
                <h4 className="text-sm text-gray-200">{cast.original_name}</h4>
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
