import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
// import { dbS } from "./db/schema";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: "/signIn",
    signOut: "/logout",
  },
});
