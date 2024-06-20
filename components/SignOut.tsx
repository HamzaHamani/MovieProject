import { signOut } from "@/auth";
import { handleLogout } from "@/lib/actions";

export default function SignOutButton() {
  return (
    <form action={handleLogout}>
      <button type="submit">Sign out</button>
    </form>
  );
}
