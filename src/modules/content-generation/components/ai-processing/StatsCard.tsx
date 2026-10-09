import React from "react";
import { Card } from "../Card";

export const StatsCard: React.FC = () => (
  <Card className="grid grid-cols-3 gap-4 text-center">
    <div>
      <p className="text-xs text-text-secondary">Voice Fidelity</p>
      <p className="text-xl font-extrabold text-primary">96%</p>
    </div>
    <div>
      <p className="text-xs text-text-secondary">Hooks Scored</p>
      <p className="text-xl font-extrabold text-text-primary">10</p>
    </div>
    <div>
      <p className="text-xs text-text-secondary">Assets Ready</p>
      <p className="text-xl font-extrabold text-success">6</p>
    </div>
  </Card>
);

export default StatsCard;
