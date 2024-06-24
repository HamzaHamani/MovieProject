import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function MovieSkeleton({}: Props) {
  return <Skeleton className="h-[500px] w-[350px] rounded bg-textMain/60" />;
}
