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

type Props = {
  type: string;
};

const baseNavStyles =
  "round text-text mx-auto flex items-center justify-between p-4 px-16 xmd:p-3 xmd:px-10 xmd:text-sm";

const normalNav = `${baseNavStyles} w-full bg-backgroundM`;
const transparentNav = `${baseNavStyles} absolute bg-transparent left-0 right-0`;
export default async function Navbar({ type }: Props) {
  const user = await getUser();

  return (
    <nav className={`${type == "normal" ? normalNav : transparentNav} z-50`}>
      <div className="flex items-center gap-8">
        <Logo />
        <NavbarList links={links} />
      </div>
      {user ? (
        <UserDropDown user={user} />
      ) : (
        <Button className="bg-transparent font-extrabold hover:bg-transparent active:bg-transparent md:hidden">
          <Link href="/sign-in">Get Started</Link>
        </Button>
      )}

      <Hamburger />
    </nav>
  );
}
