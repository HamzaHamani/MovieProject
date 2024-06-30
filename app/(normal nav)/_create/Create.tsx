import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { AddMovie, CreateBookmark } from "@/lib/actions";
import { db } from "@/db";
import { bookmarks, bookmarksMovies } from "@/db/schema";
import { eq } from "drizzle-orm";

type Props = {};

export default async function Create({}: Props) {
  const session = await auth();
  const id = session?.user?.id as string;
  console.log(id);
  const data = await db.select().from(bookmarks);
  console.log(data);
  if (!session) {
    return <div>please sign in first</div>;
  }

  return (
    <div>
      <h2>Create Bookmark</h2>

      <form action={CreateBookmark}>
        <Input name="bookmarkName" type="text" />
        <Input name="description" type="text" />
        <Input name="id" type="hidden" value={session?.user?.id} />
        <Button type="submit">Submit</Button>
      </form>
      <h2>Add a movie</h2>
      <form action={AddMovie}>
        <Input name="movieId" type="text" />
        <Input name="review" type="text" />
        <Input name="bookmarkId" type="text" />
        <Input name="id" type="hidden" value={session?.user?.id} />
        <Button type="submit">Submit</Button>
      </form>

      <div>mvoies</div>
    </div>
  );
}
