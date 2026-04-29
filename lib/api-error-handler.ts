/**
 * API error handling middleware to prevent sensitive data leakage
 */

import { NextResponse } from "next/server";

export interface APIErrorOptions {
  context?: string;
  statusCode?: number;
  userMessage?: string;
}

/**
 * Creates a safe API error response that doesn't expose sensitive details
 */
export function createSafeErrorResponse(
  error: unknown,
  options: APIErrorOptions = {}
) {
  const {
    context = "API Error",
    statusCode = 500,
    userMessage = "An error occurred processing your request",
  } = options;

  // Log the full error internally for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, error);
  }

  // Return sanitized error to client
  return NextResponse.json(
    {
      error: userMessage,
      ...(process.env.NODE_ENV === "development" && {
        debug: error instanceof Error ? error.message : String(error),
      }),
    },
    { status: statusCode }
  );
}

/**
 * Validates TMDB API key existence without exposing its value
 */
export function validateTMDBApiKey(): boolean {
  return !!process.env.TMDB_API_KEY;
}
