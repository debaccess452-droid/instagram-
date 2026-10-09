import React from "react";
import { BillingCard } from "../components/UI";

export const BillingSettings = () => (
  <BillingCard title="Payment Method" subtitle="Primary card on file">
    <p className="text-sm text-text-primary font-medium">Visa ending in •••• 4242</p>
    <p className="text-xs text-text-muted">Expires 08/2028 · Billing email: alex@virulmuse.ai</p>
  </BillingCard>
);

export default BillingSettings;
