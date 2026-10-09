import React, { type ReactNode } from "react";
import { Card } from "@/components/cards";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

export interface PagePlaceholderProps {
  title: string;
  description: string;
  badge?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  title,
  description,
  badge,
  action,
  children,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} badge={badge} />
      {children ? (
        children
      ) : (
        <Card>
          <EmptyState
            title={title}
            description={description}
            action={action}
          />
        </Card>
      )}
    </div>
  );
};

export default PagePlaceholder;
