import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { QuickActionItem } from "../../types/dashboard";

export const QuickActionCard: React.FC<{ item: QuickActionItem }> = ({ item }) => (
  <Link
    to={item.href}
    className="group flex flex-col justify-between rounded-lg border border-card-border bg-card p-5 shadow-dm-card hover:border-primary/50 transition-all"
  >
    <div className="space-y-2">
      {item.badge && (
        <span className="inline-flex rounded-sm bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
          {item.badge}
        </span>
      )}
      <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
        {item.title}
      </h3>
      <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
    </div>
    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
      <span>Open</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </div>
  </Link>
);

export default QuickActionCard;
