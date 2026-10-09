import React from "react";
import { BillingScope } from "../components/BillingScope";
import { CurrentPlan } from "./CurrentPlan";
import { Usage } from "./Usage";
import { BillingSettings } from "./BillingSettings";
import { UpgradePlans } from "./UpgradePlans";
import { Invoices } from "./Invoices";

export const BillingDashboard = () => (
  <BillingScope>
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Billing & Subscription</h1>
      <p className="text-sm text-text-secondary">
        Manage your Creator Pro plan, monthly generation credits, and invoices.
      </p>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <CurrentPlan />
      <Usage />
    </div>
    <UpgradePlans />
    <BillingSettings />
    <Invoices />
  </BillingScope>
);

export default BillingDashboard;
