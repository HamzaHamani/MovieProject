import Link from "next/link";

type TabItem = {
  key: string;
  label: string;
};

type Props = {
  items: TabItem[];
  active?: string;
  typeM: "movie" | "tv";
  id: number;
};

export default function DetailTabs({ items, active, typeM, id }: Props) {
  return (
    <div className="mb-6 mt-1 border-b border-white/10">
      <div className="flex flex-wrap items-center gap-6 pb-3 text-sm text-gray-400">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              href={`/${typeM}/${id}?tab=${item.key}`}
              className={`relative pb-1 transition ${
                isActive ? "text-white" : "hover:text-gray-200"
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute -bottom-[10px] left-0 h-[2px] w-full bg-primaryM-500" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
