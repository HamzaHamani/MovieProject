import { signIn } from "@/auth";
import { handleSignin } from "@/lib/actions";

export function SignIn() {
  return (
    <form
      action={async () => {
        await signIn("github");
      }}
    >
      <button type="submit">Signin with GitHub</button>
    </form>
  );
}
