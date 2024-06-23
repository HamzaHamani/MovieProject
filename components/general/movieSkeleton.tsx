import { Skeleton } from "../ui/skeleton";

type Props = {};

export default function MovieSkeleton({}: Props) {
  return <Skeleton className="h-[480px] w-[320px] rounded bg-textMain/60" />;
}
