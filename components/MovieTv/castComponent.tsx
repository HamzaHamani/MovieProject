import { TCreditsSchema } from "@/types/cast";
import { CarouselComponent } from "./carousel";

type Props = {
  res: TCreditsSchema;
};

export default function CastComponent({ res }: Props) {
  return <CarouselComponent res={res} />;
}
