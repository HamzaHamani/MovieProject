import { SignIn } from "@/components/SignIn";
import { auth } from "@/auth";
import SignOut from "@/components/SignOut";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export default async function Home() {
  const session = await auth();

  return (
    <main>
      {!session ? (
        "please sign in"
      ) : (
        <div>
          hello {session.user?.name} <img src={session.user?.image as string} />
        </div>
      )}

      {!session ? (
        <div>
          {" "}
          <SignIn />
          <GoogleSignIn />
        </div>
      ) : (
        <SignOut />
      )}
    </main>
  );
}
