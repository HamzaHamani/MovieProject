import { auth } from "@/auth";
import SignOut from "@/components/SignOut";

import { getBookmarks, getUser } from "@/lib/actions";
import Create from "./_create/Create";

export default async function Home() {
  const user = await getUser();
  // const api_key = process.env.TMDB_API_KEY!;
  // console.log(api_key);

  // const res = await fetch(
  //   `https://api.themoviedb.org/3/movie/157336?language=en-US&api_key=${api_key}`
  // );

  // const data = await res.json();
  // const session = await auth();

  return (
    <main>
      <Create />
      {/* {!session ? (
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
      )} */}
    </main>
  );
}
