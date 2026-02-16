"use client";

import { useRouter } from "next/navigation";
import { PlatformConnectionCard } from "@/components/integrations/PlatformConnectionCard";

const platforms = ["tiktok", "youtube", "reelshort"];

export function IntegrationsPageClient({ connections }) {
  const router = useRouter();

  function getConnection(platform) {
    return connections.find((c) => c.platform === platform) || null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect your platforms to automatically sync metrics.
        </p>
      </div>

      <div className="grid gap-4">
        {platforms.map((platform) => (
          <PlatformConnectionCard
            key={platform}
            platform={platform}
            connection={getConnection(platform)}
            onUpdate={() => router.refresh()}
          />
        ))}
      </div>
    </div>
  );
}
