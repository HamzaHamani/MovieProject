"use client"; // Error components must be Client Components

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error.message);
  }, [error]);

  return (
    <div className="grid h-[91.5vh] place-content-center bg-backgroundM px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200">404</h1>

        <p className="text-2xl font-bold tracking-tight text-gray-300 sm:text-4xl">
          {error.message || "An error occurred"}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => reset()}
            className="mt-6 inline-block rounded bg-primaryM-500 px-5 py-3 text-sm font-medium text-backgroundM hover:bg-primaryM-700 focus:outline-none focus:ring"
          >
            Try again
          </button>
          <Link href="/search">
            <button className="mt-6 inline-block rounded bg-primaryM-500 px-5 py-3 text-sm font-medium text-backgroundM hover:bg-primaryM-700 focus:outline-none focus:ring">
              Go to Search
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
