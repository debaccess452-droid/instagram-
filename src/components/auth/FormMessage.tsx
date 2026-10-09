import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export interface FormMessageProps {
  type: "success" | "error";
  message: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({ type, message }) => {
  const isSuccess = type === "success";
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border p-3 text-xs font-medium ${
        isSuccess
          ? "border-success/30 bg-success/10 text-success"
          : "border-error/30 bg-error/10 text-error"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};

export default FormMessage;
