import { redirect } from "next/navigation";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  completeUsernameSetup,
  getCurrentUserDbProfile,
  getUser,
} from "@/lib/actions";

export const metadata: Metadata = {
  title: "Choose Username",
};

export default async function UsernamePage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const user = await getUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  const dbProfile = await getCurrentUserDbProfile();
  const existingUsername = dbProfile?.username?.trim() ?? "";

  if (existingUsername) {
    redirect("/explore");
  }

  async function setUsernameAction(formData: FormData) {
    "use server";

    const usernameInput = String(formData.get("username") ?? "");
    const result = await completeUsernameSetup(usernameInput);

    if (!result.ok) {
      redirect(`/username?error=${encodeURIComponent(result.error)}`);
    }

    redirect("/explore");
  }

  return (
    <div className="container flex min-h-[calc(100vh-72px)] items-center justify-center py-10 text-textMain">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),transparent_40%),theme(colors.backgroundM)] p-8 shadow-[0_24px_100px_rgba(0,0,0,0.28)] lg:p-6 sm:p-5">
        <h1 className="text-4xl font-semibold text-white lg:text-3xl sm:text-2xl">
          Pick a unique username
        </h1>
        <p className="mt-3 text-sm text-gray-300">
          This is mandatory so other users can follow you, become friends, and
          interact with your reviews.
        </p>

        {searchParams?.error ? (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {searchParams.error}
          </div>
        ) : null}

        <form action={setUsernameAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Username
            </label>
            <Input
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={24}
              placeholder="example_user"
              autoComplete="off"
              className="border-white/15 bg-white/5 text-white placeholder:text-gray-500"
            />
            <p className="mt-2 text-xs text-gray-400">
              Use 3-24 characters: lowercase letters, numbers, and underscores.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-primaryM-500 text-black hover:bg-primaryM-600"
          >
            Save username
          </Button>
        </form>
      </section>
    </div>
  );
}
