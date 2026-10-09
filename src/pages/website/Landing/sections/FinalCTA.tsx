import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-primary/40 bg-gradient-primary-trust p-8 sm:p-12 text-center shadow-glow-primary space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Start Creating in Your Authentic Voice</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto">
            Ready to turn rough ideas into high-converting content?
          </h2>
          <p className="text-white/85 text-sm sm:text-base max-w-xl mx-auto">
            Join 18,400+ creators using Virulmuse to write hooks, Reel scripts,
            and threads that sound unmistakably like them.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to={ROUTES.SIGNUP}>
              <Button
                variant="cta"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create Your Free Account
              </Button>
            </Link>
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="secondary" size="lg">
                Explore Live Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
