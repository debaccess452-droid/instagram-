import React from "react";
import { dashboardStats } from "../../../mock/stats";
import { quickActions } from "../../../mock/quickActions";
import { StatsCard, QuickActionCard, RecentActivity } from "../../../components/dashboard";

export const Home: React.FC = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
        Creator Command Center
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Your Creator DNA is calibrated at 92% fidelity. Ready to generate your next campaign.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat) => (
        <StatsCard key={stat.label} item={stat} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {quickActions.map((qa) => (
        <QuickActionCard key={qa.id} item={qa} />
      ))}
    </div>

    <RecentActivity />
  </div>
);

export default Home;
