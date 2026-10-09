import React, { type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-card-border",
        className
      )}
    >
      <div>
        {badge && (
          <span className="mb-2 inline-flex items-center rounded-sm bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/25">
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm sm:text-base text-text-secondary max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
