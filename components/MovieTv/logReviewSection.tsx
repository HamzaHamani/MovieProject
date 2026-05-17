"use client";

import { useState } from "react";
import { TExistingLog } from "@/lib/actions";
import { TspecifiedMovie } from "@/types/api";
import { TspecifiedTv } from "@/types/apiTv";
import LogTheMT from "./buttons/logTheMT";
import UserReviewPreview from "./userReviewPreview";

type Props = {
  show: TspecifiedMovie | TspecifiedTv;
  typeM: "movie" | "tv";
  userId?: string;
  initialLog?: TExistingLog | null;
  username?: string | null;
  likesCount?: number;
  repliesCount?: number;
};

export default function LogReviewSection({
  show,
  typeM,
  userId,
  initialLog,
  username,
  likesCount = 0,
  repliesCount = 0,
}: Props) {
  const [currentLog, setCurrentLog] = useState<TExistingLog | null>(
    initialLog ?? null,
  );
  const hasReview = Boolean(currentLog);

  return (
    <div className={hasReview ? "relative pb-[18rem] md:pb-0" : "relative"}>
      <LogTheMT
        show={show}
        typeM={typeM}
        userId={userId}
        initialLog={currentLog}
        onLogSaved={setCurrentLog}
        onLogDeleted={() => setCurrentLog(null)}
      />
      <UserReviewPreview
        log={currentLog}
        username={username}
        likesCount={likesCount}
        repliesCount={repliesCount}
        className={hasReview ? "absolute left-0 top-full mt-6 w-full max-w-[24rem] md:mt-4" : "mt-4"}
      />
    </div>
  );
}
