import React from "react";
import { BillingCard } from "../components/UI";

export const UpgradePlans = () => (
  <BillingCard title="Available Upgrades" subtitle="Scale with Studio / Agency">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-text-primary">Studio Plan — $79/month</p>
        <p className="text-xs text-text-secondary">Up to 10 Creator DNA profiles & unlimited team campaigns</p>
      </div>
      <button
        type="button"
        className="rounded-md bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white"
      >
        Upgrade to Studio
      </button>
    </div>
  </BillingCard>
);

export default UpgradePlans;
