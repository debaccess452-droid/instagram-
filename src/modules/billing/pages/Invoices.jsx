import React from "react";
import { BillingCard, StatusBadge } from "../components/UI";
import { billingMockData } from "../data/mockData";

export const Invoices = () => (
  <BillingCard title="Invoices & Receipts" subtitle="Download past billing statements">
    <div className="divide-y divide-card-border">
      {billingMockData.invoices.map((inv) => (
        <div key={inv.id} className="flex items-center justify-between py-3 text-sm">
          <div>
            <p className="font-semibold text-text-primary">{inv.id}</p>
            <p className="text-xs text-text-muted">{inv.date}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium text-text-primary">{inv.amount}</span>
            <StatusBadge label={inv.status} />
          </div>
        </div>
      ))}
    </div>
  </BillingCard>
);

export default Invoices;
