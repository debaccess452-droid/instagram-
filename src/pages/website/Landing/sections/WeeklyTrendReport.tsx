import React from "react";
import { Calendar, Sparkles } from "lucide-react";
import { Card } from "@/components/cards";

export const WeeklyTrendReport: React.FC = () => {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <Card className="p-6 sm:p-8 bg-background-elevated border-card-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
              <Calendar className="h-3.5 w-3.5" />
              <span>Weekly Creator Briefing</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary">
              Every Monday: 5 tailored content angles ready in your inbox
            </h3>
            <p className="text-sm text-text-secondary">
              Pre-matched to your Creator DNA so you can approve and schedule your entire week in 15 minutes.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Included in Creator Pro</span>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default WeeklyTrendReport;
