import { getUser } from "@/lib/actions";
import { checkRateLimit } from "@/lib/securityRateLimit";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  profileImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await getUser();

      if (!user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      const rate = checkRateLimit(`uploadthing:profile:${user.id}`, {
        windowMs: 60_000,
        max: 10,
      });

      if (!rate.allowed) {
        throw new UploadThingError("Too many upload attempts, please wait.");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl ?? file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
