import ButtonSignIn from "@/components/ButtonSignIn";
import Logo from "@/components/general/logo";
import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";

type Props = {};

export default async function page({}: Props) {
  const session = await getSession();
  if (session) redirect("/explore");
  return (
    <div className="flex items-center gap-36">
      <div className="flex flex-col">
        <h2 className="text-[190px] font-extrabold tracking-tight">Welcome!</h2>
        <span className="text-2xl -mt-10 ml-6 text-gray-300">
          Embark on an adventure into movies and TV shows with us!{" "}
        </span>
        <div className="w-[110px] h-[1px] mt-6  bg-gray-300 ml-6"></div>
      </div>
      <div className="w-[500px] h-[500px] flex flex-col  bg-textMain/90 justify-evenly p-4">
        <div className="bg-red-30 flex flex-col items-center gap-3 justify-center">
          <Logo />
          <h2 className="text-xl">Get Started</h2>
        </div>
        <div className="bg-red-70 flex flex-col gap-2 items-center justify-center ">
          <ButtonSignIn provider="google" />
          <ButtonSignIn provider="github" />
        </div>
      </div>
    </div>
  );
}
