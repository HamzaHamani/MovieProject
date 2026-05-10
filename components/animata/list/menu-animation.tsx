import { ArrowRight } from "lucide-react";

interface MenuAnimationProps {
  menuItems: { label: string; href: string }[];
}

export default function MenuAnimation({ menuItems }: MenuAnimationProps) {
  return (
    <div className="flex min-w-fit flex-col gap-2 overflow-hidden px-10">
      {menuItems.map((item, index) => (
        <div key={index} className="group/menu flex items-center gap-2">
          <ArrowRight className="size-5 -translate-x-full text-primaryM-400 opacity-0 transition duration-300 ease-out hover:z-20 group-hover/menu:translate-x-0 group-hover/menu:text-primaryM-300 group-hover/menu:opacity-100 md:size-10" />

          <h1 className="z-10 -translate-x-6 cursor-pointer font-semibold text-white transition-transform duration-300 ease-out group-hover/menu:translate-x-0 group-hover/menu:text-primaryM-300 md:-translate-x-12 md:text-2xl md:group-hover/menu:translate-x-0">
            {item.label}
          </h1>
        </div>
      ))}
    </div>
  );
}
