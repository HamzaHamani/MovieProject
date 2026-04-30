"use client";

import TopLoader from "nextjs-toploader";
import React from "react";

export default function TopLoaderClient() {
  return (
    <TopLoader
      color="#EAB308"
      showSpinner={false}
      shadow="0 0 12px #EAB308"
      height={3}
    />
  );
}
