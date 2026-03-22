import { Suspense } from "react";

import { DiscoverAgent } from "@/components/discover-agent";

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverAgent />
    </Suspense>
  );
}
