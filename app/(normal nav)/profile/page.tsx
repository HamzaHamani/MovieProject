import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserDbProfile, getUser } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Page() {
  const user = await getUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  const profile = await getCurrentUserDbProfile();
  const username = profile?.username?.trim();

  if (!username) {
    redirect("/username");
  }

  redirect(`/profile/${username}`);
}
