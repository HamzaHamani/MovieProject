"use client";

import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";

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
  const imageRef = useRef<HTMLImageElement | null>(null);
  console.log(imageRef);
  // TODO CHECK IT LATER, ERROR ACCOURS WHEN I OPEN THE PAGE FIRST TIME, BUT WHEN I REFRESH THE PAGE IT WORKS FINE, MAYBE IT'S BECAUSE OF THE CACHE OR SOMETHING ELSE

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

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
        ref={imageRef}
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
