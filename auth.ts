import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import { db } from "./db";
import { users } from "./db/schema";
import Google from "next-auth/providers/google";
import Reddit from "next-auth/providers/reddit";
import Twitter from "next-auth/providers/twitter";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
    Reddit({
      clientId: process.env.AUTH_REDDIT_ID,
      clientSecret: process.env.AUTH_REDDIT_SECRET,
    }),
  ],
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
