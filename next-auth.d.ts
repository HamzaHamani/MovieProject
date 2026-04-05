import "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
    premium?: boolean | null;
    bio?: string | null;
  }

  interface Session {
    user: {
      id: string;
      username?: string | null;
      premium?: boolean | null;
      bio?: string | null;
    } & Session["user"];
  }
}
