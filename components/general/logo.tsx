import Link from "next/link";

type Props = {};

export default function Logo({}: Props) {
  return (
    <Link
      href="/"
      aria-label="Go to homepage"
      className="block h-[39px] w-[39px] s:w-[30px]"
    >
      <img
        src="/logo.svg"
        alt="Cine-Sphere Logo"
        className="h-full w-full object-contain"
      />
    </Link>
  );
}
