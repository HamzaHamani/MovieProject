import { Button } from "../ui/button";
import NavbarList from "./navbarList";
import Logo from "../general/logo";
import Hamburger from "../ui/Hamburger";
import Link from "next/link";
import { getUser } from "@/lib/actions";
import { UserDropDown } from "./userDropDown";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/search", label: "Search" },
];

type Props = {};
export default async function Navbar({}: Props) {
  //TODO FIX ISSUE WITH NAVBAR MARGIN TOP
  const user = await getUser();
  return (
    <nav className="flex w-[100%] mx-auto round bg-backgroundM text-text items-center  xmd:text-sm    justify-between px-16 p-4  xmd:p-3 xmd:px-10">
      <Logo />
      <NavbarList links={links} />
      {user ? (
        <UserDropDown user={user} />
      ) : (
        <Button className="bg-transparent hover:bg-transparent font-extrabold md:hidden active:bg-transparent">
          <Link href="/sign-in">Get Started</Link>
        </Button>
      )}

      <Hamburger />
    </nav>
  );
}
