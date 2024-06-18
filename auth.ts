import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "./db";
import google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, google],
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: "/signIn",
    signOut: "/logout",
  },
});
