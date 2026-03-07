import LazyBlurImage from "../ui/lazyBlurImage";

type Props = {};

export default function Logo({}: Props) {
  return (
    <div className="h-[39px] w-[39px] s:w-[30px]">
      <LazyBlurImage
        src="/logo.svg"
        alt="Cine-Sphere Logo"
        className="h-full w-full object-contain"
        placeholderClassName="bg-zinc-700/20"
      />
    </div>
  );
}
