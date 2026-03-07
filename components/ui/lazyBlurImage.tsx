"use client";

import { ImgHTMLAttributes, useState } from "react";

import { cn } from "@/lib/utils";

type LazyBlurImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  containerClassName?: string;
  placeholderClassName?: string;
  transitionMs?: number;
};

export default function LazyBlurImage({
  src,
  alt,
  className,
  containerClassName,
  placeholderClassName,
  transitionMs = 800,
  loading,
  decoding,
  onLoad,
  onError,
  ...props
}: LazyBlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        containerClassName,
      )}
    >
      {!isLoaded && !hasError && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-zinc-700/55",
            placeholderClassName,
          )}
          aria-hidden="true"
        />
      )}

      <img
        src={src}
        alt={alt}
        loading={loading ?? "lazy"}
        decoding={decoding ?? "async"}
        className={cn(
          "h-full w-full object-cover transition-all",
          isLoaded ? "scale-100 blur-0" : "scale-105 blur-xl",
          className,
        )}
        style={{ transitionDuration: `${transitionMs}ms` }}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setHasError(true);
          onError?.(event);
        }}
        {...props}
      />
    </div>
  );
}
