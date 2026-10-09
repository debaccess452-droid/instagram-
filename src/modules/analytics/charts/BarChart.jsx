import React from "react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartTheme } from "./ChartTheme";

export const BarChart = ({
  data = [],
  xKey = "label",
  yKey = "value",
  color = ChartTheme.colors.trust,
  height = 260,
}) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={ChartTheme.colors.grid} />
          <XAxis dataKey={xKey} stroke={ChartTheme.colors.text} fontSize={12} />
          <YAxis stroke={ChartTheme.colors.text} fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: ChartTheme.colors.tooltipBg,
              border: `1px solid ${ChartTheme.colors.grid}`,
              borderRadius: "8px",
              color: "#F8FAFC",
            }}
          />
          <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
