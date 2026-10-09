import React from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartTheme } from "./ChartTheme";

export const LineChart = ({
  data = [],
  xKey = "label",
  yKey = "value",
  color = ChartTheme.colors.success,
  height = 260,
}) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
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
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
