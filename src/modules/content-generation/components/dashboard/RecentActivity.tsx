import React from "react";
import { Link } from "react-router-dom";
import { recentActivity } from "../../mock/activity";
import { ROUTES } from "@/constants/routes";

export const RecentActivity: React.FC = () => (
  <div className="rounded-lg border border-card-border bg-card p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-bold text-text-primary">Recent DNA Generations</h3>
      <Link to={ROUTES.HISTORY} className="text-xs font-semibold text-primary hover:underline">
        View All Library
      </Link>
    </div>
    <div className="divide-y divide-card-border">
      {recentActivity.map((act) => (
        <div key={act.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{act.title}</p>
            <p className="text-xs text-text-muted">
              {act.platform} · {act.timestamp}
            </p>
          </div>
          <span className="rounded-sm bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
            {act.score}% DNA Match
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default RecentActivity;
