"use client";

import { toast } from "sonner";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationInput {
  title: string;
  message?: string;
  type?: NotificationType;
  posterPath?: string | null;
  duration?: number;
}

const notificationColors = {
  success: "bg-emerald-500/10 border-emerald-500/30",
  error: "bg-red-500/10 border-red-500/30",
  info: "bg-blue-500/10 border-blue-500/30",
  warning: "bg-amber-500/10 border-amber-500/30",
};

const iconColors = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-blue-400",
  warning: "text-amber-400",
};

const icons = {
  success: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  info: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4v2m0-6a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export function showNotification({
  title,
  message,
  type = "info",
  posterPath,
  duration = 3500,
}: NotificationInput) {
  toast.custom(
    () => (
      <div
        className={`flex h-14 w-[350px] items-stretch overflow-hidden rounded-xl border bg-backgroundM text-textMain shadow-lg ${notificationColors[type]}`}
      >
        {posterPath ? (
          <div className="h-full w-14 shrink-0 overflow-hidden bg-white/10">
            <img
              src={`https://image.tmdb.org/t/p/w185/${posterPath}`}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex h-full w-14 shrink-0 items-center justify-center ${iconColors[type]}`}
          >
            {icons[type]}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {title}
          </p>
          {message && (
            <p className="truncate text-xs leading-tight text-gray-300">
              {message}
            </p>
          )}
        </div>
      </div>
    ),
    { position: "bottom-left", duration },
  );
}

export function showSuccessNotification(
  title: string,
  message?: string,
  posterPath?: string | null,
) {
  showNotification({
    title,
    message,
    type: "success",
    posterPath,
  });
}

export function showErrorNotification(
  title: string,
  message?: string,
  posterPath?: string | null,
) {
  showNotification({
    title,
    message,
    type: "error",
    posterPath,
  });
}

export function showInfoNotification(
  title: string,
  message?: string,
  posterPath?: string | null,
) {
  showNotification({
    title,
    message,
    type: "info",
    posterPath,
  });
}

export function showWarningNotification(
  title: string,
  message?: string,
  posterPath?: string | null,
) {
  showNotification({
    title,
    message,
    type: "warning",
    posterPath,
  });
}
