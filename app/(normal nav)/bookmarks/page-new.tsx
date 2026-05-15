import { redirect } from "next/navigation";
import { getUser, getCurrentUserDbProfile } from "@/lib/actions";

export default async function BookmarksPage() {
  const user = await getUser();

  if (!user?.id) {
    // Not authenticated, redirect to sign in
    redirect("/sign-in");
  }

  const profile = await getCurrentUserDbProfile();

  if (!profile?.username) {
    // No username, redirect to setup
    redirect("/explore?setupUsername=1");
  }

  // Redirect to username-specific bookmarks page
  redirect(`/bookmarks/${profile.username}`);
}
