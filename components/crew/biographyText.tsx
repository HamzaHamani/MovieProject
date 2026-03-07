"use client";

import { useMemo, useState } from "react";

type Props = {
  text: string;
  maxChars?: number;
  className?: string;
};

export default function BiographyText({
  text,
  maxChars = 520,
  className,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const cleanText = useMemo(() => text.trim(), [text]);
  const shouldCollapse = cleanText.length > maxChars;

  const displayedText = useMemo(() => {
    if (!shouldCollapse || expanded) return cleanText;

    const sliced = cleanText.slice(0, maxChars);
    const lastSpace = sliced.lastIndexOf(" ");
    const safeSlice = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;

    return `${safeSlice}...`;
  }, [cleanText, expanded, maxChars, shouldCollapse]);

  return (
    <div>
      <p className={className}>{displayedText}</p>
      {shouldCollapse ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-sm font-medium text-primaryM-500 transition hover:text-primaryM-300"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
