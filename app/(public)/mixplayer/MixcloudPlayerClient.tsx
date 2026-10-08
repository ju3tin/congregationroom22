"use client";

import { useSearchParams } from "next/navigation";
import MixcloudPlayer from "@/components/MixcloudPlayer";

export default function MixcloudPlayerClient() {
  const searchParams = useSearchParams();

  const apiUrl = searchParams.get("url");

  if (!apiUrl) {
    return (
      <div className="p-6 text-red-500">
        Missing Mixcloud URL
      </div>
    );
  }

  return (
    <div className="w-full">
      <MixcloudPlayer
        apiUrl={apiUrl}
        height={180}
        color="2563eb"
      />
    </div>
  );
}