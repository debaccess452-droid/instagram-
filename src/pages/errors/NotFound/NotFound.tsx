import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/buttons";
import { ROUTES } from "@/constants/routes";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-primary px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">404 Error</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-text-secondary">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to={ROUTES.HOME}>
          <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
