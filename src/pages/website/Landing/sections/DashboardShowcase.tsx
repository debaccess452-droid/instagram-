import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/cards";
import { Button } from "@/components/buttons";
import { SectionTitle } from "@/components/common";
import { ROUTES } from "@/constants/routes";

export const DashboardShowcase: React.FC = () => {
  return (
    <section className="py-20 bg-background-elevated/40 border-y border-card-border">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionTitle
          eyebrow="Unified Workspace"
          title="Everything in one high-velocity creator command center"
          subtitle="Track Personalization, generate multi-platform campaigns, and review performance metrics side by side."
        />

        <Card className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-card-border bg-background p-4">
              <p className="text-xs text-text-secondary">Personalization</p>
              <p className="mt-1 text-2xl font-bold text-success">92% Calibrated</p>
              <p className="mt-1 text-xs text-text-muted">+6% from last 10 posts</p>
            </div>
            <div className="rounded-md border border-card-border bg-background p-4">
              <p className="text-xs text-text-secondary">Saved Library Assets</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">148 Posts</p>
              <p className="mt-1 text-xs text-text-muted">Across IG, X & LinkedIn</p>
            </div>
            <div className="rounded-md border border-card-border bg-background p-4">
              <p className="text-xs text-text-secondary">Avg. Hook Score</p>
              <p className="mt-1 text-2xl font-bold text-primary">9.1 / 10</p>
              <p className="mt-1 text-xs text-text-muted">Top 5% creator benchmark</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Explore the live dashboard, analytics, and content generator</span>
            </div>
            <Link to={ROUTES.DASHBOARD}>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Open Live Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default DashboardShowcase;
