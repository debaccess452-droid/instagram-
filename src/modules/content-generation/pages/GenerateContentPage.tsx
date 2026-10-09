import React from "react";
import { Header } from "../components/Header";
import { StepIndicator } from "../components/StepIndicator";
import { GenerateForm } from "../components/GenerateForm";
import { FooterNote } from "../components/FooterNote";

export const GenerateContentPage: React.FC = () => (
  <div className="space-y-6 max-w-3xl">
    <StepIndicator step={1} />
    <Header
      title="Generate Authentic Social Content"
      subtitle="Turn a single rough idea into hooks, Reel scripts, captions, and threads calibrated to your Creator DNA."
    />
    <GenerateForm />
    <FooterNote />
  </div>
);

export default GenerateContentPage;
