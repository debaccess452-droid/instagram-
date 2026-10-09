import React from "react";
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartTheme } from "./ChartTheme";

export const AreaChart = ({
  data = [],
  xKey = "label",
  yKey = "value",
  color = ChartTheme.colors.primary,
  height = 260,
}) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2.5}
            fill="url(#areaGrad)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
