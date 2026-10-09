import React from "react";
import { BillingCard } from "../components/UI";
import { billingMockData } from "../data/mockData";

export const Usage = () => {
  const { usage } = billingMockData;
  const pct = Math.round((usage.creditsUsed / usage.creditsTotal) * 100);
  return (
    <BillingCard title="Monthly Generation Credits" subtitle="Resets on the 1st of each month">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span>{usage.creditsUsed} of {usage.creditsTotal} campaigns used</span>
          <span className="text-primary">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-background overflow-hidden">
          <div className="h-full bg-gradient-primary-trust rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </BillingCard>
  );
};

export default Usage;
