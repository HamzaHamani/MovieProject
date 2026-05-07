import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="container py-12 text-textMain">
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.25)] sm:p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primaryM-500">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-2xl">
            Privacy Policy
          </h1>
        </div>

        <p className="text-sm leading-7 text-gray-300">
          CineSphere stores the account and profile information needed to run
          your account, plus the content you create such as reviews, lists,
          follows, and activity.
        </p>

        <p className="text-sm leading-7 text-gray-300">
          We use external providers for authentication and movie metadata. That
          means some data may be shared with those providers to make login,
          search, and media pages work correctly.
        </p>

        <p className="text-sm leading-7 text-gray-300">
          You can choose what to publish through your profile and list
          visibility settings. Private content stays limited to the intended
          audience within the app.
        </p>

        <div className="pt-2">
          <Link
            href="/sign-in"
            className="inline-flex rounded-full bg-primaryM-500 px-4 py-2 text-sm font-medium text-black hover:bg-primaryM-600"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
