"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";
import { config } from "dotenv";

config({ path: ".env.local" });
export default function ClarityInit() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (projectId) {
      Clarity.init(projectId);
    } else {
      console.warn("Clarity Project ID is missing.");
    }
  }, []);

  return null;
}
