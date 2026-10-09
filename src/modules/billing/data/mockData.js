export const billingMockData = {
  currentPlan: {
    name: "Creator Pro",
    price: "$29 / month",
    renewalDate: "November 1, 2026",
    status: "Active",
  },
  usage: {
    creditsUsed: 74,
    creditsTotal: 100,
    dnaProfilesUsed: 2,
    dnaProfilesLimit: 5,
  },
  invoices: [
    { id: "INV-2026-10", date: "Oct 1, 2026", amount: "$29.00", status: "Paid" },
    { id: "INV-2026-09", date: "Sep 1, 2026", amount: "$29.00", status: "Paid" },
    { id: "INV-2026-08", date: "Aug 1, 2026", amount: "$29.00", status: "Paid" },
  ],
};

export default billingMockData;
