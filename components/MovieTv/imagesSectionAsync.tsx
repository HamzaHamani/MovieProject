import { getImagesByType } from "@/lib/actions";
import ImagesSection from "./imagesSection";

type Props = {
  id: number;
  typeM: "movie" | "tv";
};

export default async function ImagesSectionAsync({ id, typeM }: Props) {
  const items = await getImagesByType(String(id), typeM);
  return <ImagesSection items={items} />;
}
