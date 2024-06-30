import ButtonSignIn from "@/components/ButtonSignIn";
import Toast from "@/components/toast";
import { getUser } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  console.log(searchParams?.error);

  const user = await getUser();
  if (user) redirect("/explore");
  return (
    <div className="flex h-[92.7vh] gap-36">
      <div className="mt-20 flex flex-col">
        <h2 className="text-[190px] font-extrabold tracking-tight">Welcome!</h2>
        <Toast error={searchParams?.error} />
        <span className="-mt-10 ml-6 text-2xl text-gray-300">
          Embark on an adventure into movies and TV shows with us!{" "}
        </span>
        <div className="ml-6 mt-6 h-[1px] w-[110px] bg-gray-300"></div>
      </div>
      <div className="mt-20 flex h-[500px] w-[500px] flex-col justify-end rounded-3xl p-4">
        <h2>Log-in to your account</h2>
        <div className="bg-red-70 flex items-center justify-center gap-2">
          <ButtonSignIn provider="google" />
          <ButtonSignIn provider="github" />
        </div>
      </div>
    </div>
  );
}
