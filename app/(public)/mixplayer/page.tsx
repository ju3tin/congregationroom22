import { Suspense } from "react";
import MixcloudPlayerClient from "./MixcloudPlayerClient";

export default function MixplayerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center">
          Loading player...
        </div>
      }
    >
      <MixcloudPlayerClient />
    </Suspense>
  );
}