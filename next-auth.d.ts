import "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
    premium?: boolean | null;
  }

  interface Session {
    user: {
      id: string;
      username?: string | null;
      premium?: boolean | null;
    } & Session["user"];
  }
}
