import { getWatchProvidersByType } from "@/lib/actions";
import WatchProvidersSection from "./watchProvidersSection";

type Props = {
  id: number;
  typeM: "movie" | "tv";
};

export default async function WatchProvidersSectionAsync({ id, typeM }: Props) {
  const providers = await getWatchProvidersByType(String(id), typeM);
  return <WatchProvidersSection providers={providers} />;
}
