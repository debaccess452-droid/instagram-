import type { NotificationItem } from "../types/dashboard";

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif_1",
    title: "Creator DNA calibrated to 92% voice fidelity",
    time: "2h ago",
    unread: true,
  },
  {
    id: "notif_2",
    title: "Weekly Trend Report is ready for review",
    time: "1d ago",
  },
];

export default mockNotifications;
