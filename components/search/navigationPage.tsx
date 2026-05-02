import usePage from "@/hooks/usePage";
import type { TsearchApiResponse } from "@/types/api";

type Props = {
  data: TsearchApiResponse;
};

export default function NavigationPage({ data }: Props) {
  const { page } = usePage();
  return (
    <span>
      {page}-{data?.total_pages}
    </span>
  );
}
