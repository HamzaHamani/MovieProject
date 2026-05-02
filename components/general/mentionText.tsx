import Link from "next/link";

type Props = {
  text: string;
  className?: string;
  mentionClassName?: string;
  disableLinks?: boolean;
};

function getMentionHref(token: string) {
  const raw = token.slice(1);
  if (!raw) return null;

  const crewMatch = raw.match(/^([a-z0-9_-]+)-(\d+)$/i);
  if (crewMatch) {
    return `/crew/${crewMatch[2]}`;
  }

  if (/^[a-z0-9_][a-z0-9_\-]{1,31}$/i.test(raw)) {
    return `/profile/${raw.toLowerCase()}`;
  }

  return null;
}

export default function MentionText({
  text,
  className,
  mentionClassName,
  disableLinks = false,
}: Props) {
  const nodes: React.ReactNode[] = [];
  const mentionRegex = /\B@[a-z0-9_-]+/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(text)) !== null) {
    const mention = match[0];
    const start = match.index;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const href = getMentionHref(mention);

    if (href && !disableLinks) {
      nodes.push(
        <Link
          key={`${mention}-${start}`}
          href={href}
          className={
            mentionClassName ??
            "font-semibold text-primaryM-400 transition hover:text-primaryM-300"
          }
        >
          {mention}
        </Link>,
      );
    } else if (href && disableLinks) {
      nodes.push(
        <span
          key={`${mention}-${start}`}
          className={mentionClassName ?? "font-semibold text-primaryM-400"}
        >
          {mention}
        </span>,
      );
    } else {
      nodes.push(mention);
    }

    lastIndex = start + mention.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <span className={className}>{nodes}</span>;
}
