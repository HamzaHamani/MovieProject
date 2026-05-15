import { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/config/site";
import { generatePageMetadata } from "@/lib/seo-utils";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms of Service",
  description:
    "Read the terms and conditions for using Cinesphere, including account, content, and platform usage rules.",
  canonical: `${SITE_URL}/terms`,
});

export default function TermsPage() {
  return (
    <main className="container py-12 text-textMain">
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.25)] sm:p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primaryM-500">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-2xl">
            Terms of Service
          </h1>
        </div>

        <p className="text-sm leading-7 text-gray-300">
          CineSphere is a movie discovery and social app. By using the service,
          you agree to use it responsibly, respect other users, and follow any
          applicable laws and platform rules.
        </p>

        <p className="text-sm leading-7 text-gray-300">
          User-generated content, including reviews, lists, profile text, and
          comments, may be visible to others depending on your privacy settings
          and list visibility choices.
        </p>

        <p className="text-sm leading-7 text-gray-300">
          We may update these terms as the app changes. If you continue to use
          CineSphere after an update, you accept the revised terms.
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
