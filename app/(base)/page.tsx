import { SignIn } from "@/components/SignIn";
import { auth } from "@/auth";
import SignOut from "@/components/SignOut";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export default async function Home() {
  const session = await auth();
  console.log(session);

  return (
    <main>
      {!session ? "please sign in" : `hello ${session.user?.name}`}

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
