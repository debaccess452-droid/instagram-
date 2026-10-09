import React from "react";

export const Heatmap = ({ slots = [] }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["9am", "12pm", "3pm", "6pm", "9pm"];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-2 text-xs text-text-muted">
        <div />
        {hours.map((h) => (
          <div key={h} className="text-center">
            {h}
          </div>
        ))}
      </div>
      {days.map((day, dIdx) => (
        <div key={day} className="grid grid-cols-6 gap-2 items-center">
          <span className="text-xs font-medium text-text-secondary">{day}</span>
          {hours.map((hour, hIdx) => {
            const intensity = slots[(dIdx + hIdx) % (slots.length || 1)] || ((dIdx * 3 + hIdx * 2) % 4) + 1;
            const bg =
              intensity >= 4
                ? "bg-primary"
                : intensity === 3
                ? "bg-primary/70"
                : intensity === 2
                ? "bg-primary/40"
                : "bg-primary/15";
            return (
              <div
                key={`${day}-${hour}`}
                className={`h-7 rounded-sm ${bg} border border-card-border/40`}
                title={`${day} ${hour}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Heatmap;
