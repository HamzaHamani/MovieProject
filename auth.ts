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

const providers = [];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  );
}

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
  providers.push(
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
  );
}

if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
  );
}

if (process.env.AUTH_REDDIT_ID && process.env.AUTH_REDDIT_SECRET) {
  providers.push(
    Reddit({
      clientId: process.env.AUTH_REDDIT_ID,
      clientSecret: process.env.AUTH_REDDIT_SECRET,
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
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
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
