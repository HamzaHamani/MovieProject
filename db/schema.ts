import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { AdapterAccountType } from "next-auth/adapters";
import { create } from "domain";
import { relations } from "drizzle-orm";

// const connectionString = "postgres://postgres:postgres@localhost:5432/drizzle";
// const pool = postgres(connectionString, { max: 1 });

// export const dbS = drizzle(pool);

export const users = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email"),
    username: text("username"),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    bio: text("bio"),
    premium: boolean("premium").default(false),
  },
  (user) => ({
    usernameUnique: uniqueIndex("user_username_unique").on(user.username),
  }),
);

export const bookmarks = pgTable("bookmarks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookmarkName: text("bookmarkName").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

export const bookmarksMovies = pgTable("bookmarksMovies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookmarkId: text("bookmarkId")
    .notNull()
    .references(() => bookmarks.id, { onDelete: "cascade" }),
  movieId: text("movieId").notNull(),
  review: text("review").notNull(),
  addedAt: timestamp("addedAt", { mode: "date" }).defaultNow(),
});

export const loggedMovies = pgTable("logged_movies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  showId: text("showId").notNull(), // TMDb ID
  review: text("review"),
  watchType: text("watchType").notNull().default("first"),
  reviewTitle: text("reviewTitle"), // Optional title for the review
  rating: real("rating"), // 0 to 5 with half-star precision

  watchedAt: timestamp("watchedAt", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const userFollows = pgTable(
  "user_follows",
  {
    followerId: text("followerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("followingId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  }),
);

export const reviewLikes = pgTable(
  "review_likes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reviewId: text("reviewId")
      .notNull()
      .references(() => loggedMovies.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    reviewLikeUnique: uniqueIndex("review_likes_user_review_unique").on(
      table.userId,
      table.reviewId,
    ),
  }),
);

export const reviewReplies = pgTable("review_replies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reviewId: text("reviewId")
    .notNull()
    .references(() => loggedMovies.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const listLikes = pgTable(
  "list_likes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookmarkId: text("bookmarkId")
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    listLikeUnique: uniqueIndex("list_likes_user_bookmark_unique").on(
      table.userId,
      table.bookmarkId,
    ),
  }),
);

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

// Define relationships for users

export const usersRelations = relations(users, ({ one, many }) => ({
  bookmarks: many(bookmarks),
  followers: many(userFollows, { relationName: "userFollowers" }),
  following: many(userFollows, { relationName: "userFollowing" }),
  reviewLikes: many(reviewLikes),
  reviewReplies: many(reviewReplies),
  listLikes: many(listLikes),
}));

// Define relationships for bookmarks

export const bookmarksRelations = relations(bookmarks, ({ one, many }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  bookmarkMovies: many(bookmarksMovies),
  likes: many(listLikes),
}));
// Define relationships for bookmarkMovies

export const bookmarkMoviesRelations = relations(
  bookmarksMovies,
  ({ one }) => ({
    bookmark: one(bookmarks, {
      fields: [bookmarksMovies.bookmarkId],
      references: [bookmarks.id],
    }),
  }),
);

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "userFollowing",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "userFollowers",
  }),
}));

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
  user: one(users, {
    fields: [reviewLikes.userId],
    references: [users.id],
  }),
  review: one(loggedMovies, {
    fields: [reviewLikes.reviewId],
    references: [loggedMovies.id],
  }),
}));

export const reviewRepliesRelations = relations(reviewReplies, ({ one }) => ({
  user: one(users, {
    fields: [reviewReplies.userId],
    references: [users.id],
  }),
  review: one(loggedMovies, {
    fields: [reviewReplies.reviewId],
    references: [loggedMovies.id],
  }),
}));

export const listLikesRelations = relations(listLikes, ({ one }) => ({
  user: one(users, {
    fields: [listLikes.userId],
    references: [users.id],
  }),
  bookmark: one(bookmarks, {
    fields: [listLikes.bookmarkId],
    references: [bookmarks.id],
  }),
}));
