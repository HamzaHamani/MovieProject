import { AnimatedSubscribeButton } from "@/components/customUi/animated-subscribe-button";
import { CheckIcon, ChevronRightIcon, Share2 } from "lucide-react";

export function ButtonAnimation({
  text,
  afterText,
  icon,
  typeSearch,
}: {
  text: string;
  afterText: string;
  icon: any;
  typeSearch: "Movie" | "TV show";
}) {
  return (
    <AnimatedSubscribeButton
      buttonColor="#0d0c0f"
      buttonTextColor="#ffffff"
      subscribeStatus={false}
      typeSearch={typeSearch}
      initialText={
        <span className="group inline-flex items-center">
          {text}
          <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
            {icon}
          </span>
        </span>
      }
      changeText={
        <span className="group inline-flex items-center">
          <CheckIcon className="mr-2 h-4 w-4" />
          {afterText}
        </span>
      }
    />
  );
}
