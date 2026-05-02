"use client";

import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "../ui/PlaceholdersAndVanishInput";
import { useEffect, useState } from "react";
import usePage from "@/hooks/usePage";
import { useSearchParams } from "next/navigation";

export function SearchVanishComp({ className }: { className?: string }) {
  const router = useRouter();
  const { setPage } = usePage();
  const searchParams = useSearchParams();

  const placeholders = [
    "Search for a film...",
    "Find your favorite TV show...",
    "Discover new releases...",
    "What's trending now?",
    "Explore top-rated films...",
    "Find a classic film...",
    "Search for a TV series...",
    "What's popular this week?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search");
    setPage(1);
    const activeType = searchParams.get("type") ?? "all";

    if (searchValue) {
      router.push(
        `/search/${encodeURIComponent(String(searchValue))}?type=${activeType}`,
      );
    }
  };
  return (
    <PlaceholdersAndVanishInput
      placeholders={placeholders}
      onChange={handleChange}
      onSubmit={onSubmit}
    />
  );
}
