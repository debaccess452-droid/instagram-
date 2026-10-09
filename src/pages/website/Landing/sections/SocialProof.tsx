import React from "react";

const STATS = [
  { value: "18,400+", label: "Active Creators & Founders" },
  { value: "94.8%", label: "Average Voice Match Score" },
  { value: "3.4x", label: "Faster Weekly Content Output" },
  { value: "1.2M+", label: "Hooks & Scripts Generated" },
];

export const SocialProof: React.FC = () => {
  return (
    <section className="border-y border-card-border bg-background-elevated/50 py-10">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          {STATS.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                {item.value}
              </p>
              <p className="text-xs sm:text-sm text-text-secondary">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
