"use client";

import { RoleDashboard } from "@/components/dashboards";
import { FadeIn } from "@/components/ui/primitives";
import { Disclaimer } from "@/components/ui/common";

export default function AppHome() {
  return (
    <FadeIn>
      <RoleDashboard />
      <div className="mt-6">
        <Disclaimer />
      </div>
    </FadeIn>
  );
}
