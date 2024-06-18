import { signOut } from "@/auth";

export default function SignOut() {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signOut();
      }}
    >
      <button type="submit">Sign out</button>
    </form>
  );
}
