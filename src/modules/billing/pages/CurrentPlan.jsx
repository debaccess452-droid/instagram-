import React from "react";
import { BillingCard, StatusBadge } from "../components/UI";
import { billingMockData } from "../data/mockData";

export const CurrentPlan = () => {
  const { currentPlan } = billingMockData;
  return (
    <BillingCard
      title="Current Subscription"
      subtitle={`Renews on ${currentPlan.renewalDate}`}
      right={<StatusBadge label={currentPlan.status} />}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xl font-extrabold text-text-primary">{currentPlan.name}</p>
          <p className="text-xs text-text-secondary">Full Creator DNA calibration & multi-platform studio</p>
        </div>
        <p className="text-lg font-bold text-primary">{currentPlan.price}</p>
      </div>
    </BillingCard>
  );
};

export default CurrentPlan;
