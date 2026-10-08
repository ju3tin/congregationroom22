"use client";

import { useSearchParams } from "next/navigation";
import MixcloudPlayer from "@/components/MixcloudPlayer";

export default function MixcloudPage() {
  const searchParams = useSearchParams();

  const apiUrl = searchParams.get("url");

  if (!apiUrl) {
    return <div>Missing Mixcloud URL</div>;
  }

  return (
    <MixcloudPlayer
      apiUrl={apiUrl}
      height={180}
      color="2563eb"
    />
  );
}