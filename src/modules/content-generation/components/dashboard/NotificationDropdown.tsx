import React from "react";
import { mockNotifications } from "../../mock/notifications";

export const NotificationDropdown: React.FC = () => (
  <div className="space-y-2">
    {mockNotifications.map((n) => (
      <div key={n.id} className="text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{n.title}</span> · {n.time}
      </div>
    ))}
  </div>
);

export default NotificationDropdown;
