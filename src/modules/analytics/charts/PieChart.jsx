import React from "react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ChartTheme } from "./ChartTheme";

const COLORS = [
  ChartTheme.colors.primary,
  ChartTheme.colors.trust,
  ChartTheme.colors.cta,
  ChartTheme.colors.success,
];

export const PieChart = ({ data = [], nameKey = "name", dataKey = "value", height = 240 }) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={dataKey}
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: ChartTheme.colors.tooltipBg,
              border: `1px solid ${ChartTheme.colors.grid}`,
              borderRadius: "8px",
              color: "#F8FAFC",
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
