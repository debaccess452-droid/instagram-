import React from "react";

export const StatusStates = ({ status = "Active" }) => (
  <span className="text-xs font-semibold text-growthGreen-light">{status}</span>
);

export default StatusStates;
