import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import { db } from "./db";
import google from "next-auth/providers/google";
import Reddit from "next-auth/providers/reddit";
import Twitter from "next-auth/providers/twitter";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, google, Twitter, Facebook, Reddit],
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: "/sign-in",
  },
});

// !TODO dont forget to add callbakc url on facebook, i couldnt uz they dont allow localhost they need https
