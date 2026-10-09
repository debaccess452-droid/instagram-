import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./Card";
import { PlatformSelector } from "./PlatformSelector";
import { ContentTypeSelector } from "./ContentTypeSelector";
import { Textarea } from "./Textarea";
import { Select } from "./Select";
import { QuickOptions } from "./QuickOptions";
import { PrimaryButton } from "./PrimaryButton";
import { TONE_OPTIONS } from "../data/options";
import { ROUTES } from "@/constants/routes";

export const GenerateForm: React.FC = () => {
  const [platform, setPlatform] = useState("instagram");
  const [contentType, setContentType] = useState("full-bundle");
  const [idea, setIdea] = useState(
    "Why most creators burn out after 30 days of daily posting, and the 3-step batching framework that fixed it for me."
  );
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.RESULTS_OVERVIEW);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <PlatformSelector selected={platform} onChange={setPlatform} />
        <ContentTypeSelector selected={contentType} onChange={setContentType} />
        <Textarea
          label="Your Rough Idea, Voice Note, or Core Insight"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Drop your raw thought or topic here..."
          required
        />
        <QuickOptions onPick={setIdea} />
        <Select
          label="Voice Calibration Profile"
          options={TONE_OPTIONS}
          value={tone}
          onChange={setTone}
        />
        <PrimaryButton type="submit">
          Generate Campaign with Creator DNA
        </PrimaryButton>
      </form>
    </Card>
  );
};

export default GenerateForm;
