import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";
import Google from "next-auth/providers/google";
import Reddit from "next-auth/providers/reddit";
import Twitter from "next-auth/providers/twitter";
import { eq } from "drizzle-orm";
import { getOptionalEnvVariable } from "@/lib/env";

const providers = [];

const githubId = getOptionalEnvVariable("AUTH_GITHUB_ID");
const githubSecret = getOptionalEnvVariable("AUTH_GITHUB_SECRET");
if (githubId && githubSecret) {
  providers.push(
    GitHub({
      clientId: githubId,
      clientSecret: githubSecret,
    }),
  );
}

const googleId = getOptionalEnvVariable("AUTH_GOOGLE_ID");
const googleSecret = getOptionalEnvVariable("AUTH_GOOGLE_SECRET");
if (googleId && googleSecret) {
  providers.push(
    Google({
      clientId: googleId,
      clientSecret: googleSecret,
    }),
  );
}

const twitterId = getOptionalEnvVariable("AUTH_TWITTER_ID");
const twitterSecret = getOptionalEnvVariable("AUTH_TWITTER_SECRET");
if (twitterId && twitterSecret) {
  providers.push(
    Twitter({
      clientId: twitterId,
      clientSecret: twitterSecret,
    }),
  );
}

const facebookId = getOptionalEnvVariable("AUTH_FACEBOOK_ID");
const facebookSecret = getOptionalEnvVariable("AUTH_FACEBOOK_SECRET");
if (facebookId && facebookSecret) {
  providers.push(
    Facebook({
      clientId: facebookId,
      clientSecret: facebookSecret,
    }),
  );
}

const redditId = getOptionalEnvVariable("AUTH_REDDIT_ID");
const redditSecret = getOptionalEnvVariable("AUTH_REDDIT_SECRET");
if (redditId && redditSecret) {
  providers.push(
    Reddit({
      clientId: redditId,
      clientSecret: redditSecret,
    }),
  );
}

if (providers.length === 0) {
  // Fallback provider keeps session/auth routes healthy when OAuth env vars are missing.
  providers.push(
    Credentials({
      id: "disabled-auth",
      name: "Disabled Auth",
      credentials: {},
      async authorize() {
        return null;
      },
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  secret:
    getOptionalEnvVariable("AUTH_SECRET") ??
    getOptionalEnvVariable("NEXTAUTH_SECRET") ??
    "replace-this-with-auth-secret-in-env",
  trustHost: true,
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async session({ session, user }) {
      const userMeta = await db
        .select({
          username: users.username,
          premium: users.premium,
          image: users.image,
          bio: users.bio,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      const dbUser = userMeta[0];

      if (session.user) {
        session.user.id = user.id;
        session.user.username = dbUser?.username ?? null;
        session.user.premium = dbUser?.premium ?? false;
        session.user.image = dbUser?.image ?? session.user.image;
        session.user.bio = dbUser?.bio ?? null;
      }

      return session;
    },
  },
});

// !TODO dont forget to add callbakc url on facebook, i couldnt uz they dont allow localhost they need https
