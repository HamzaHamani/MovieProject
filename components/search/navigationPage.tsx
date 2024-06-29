import usePage from "@/hooks/usePage";
import { TsearchMovie } from "@/types/api";

type Props = {
  data: TsearchMovie;
};

export default function NavigationPage({ data }: Props) {
  const { page } = usePage();
  return (
    <span>
      {page}-{data?.total_pages}
    </span>
  );
}
