type Props = {};

export default function NoResults({}: Props) {
  return (
    <div className="flex h-[65vh] items-center justify-center">
      <h2 className="text-center text-9xl font-extrabold tracking-tighter xl:text-8xl lg:text-7xl xsmd:text-3xl md:text-6xl sss:text-5xl s:text-3xl">
        No Results Found
      </h2>
    </div>
  );
}
