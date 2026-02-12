import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NotificationBell from "@/components/layout/NotificationBell";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock notification API
const mockGetUnreadCount = vi.fn().mockResolvedValue(3);
const mockGetNotifications = vi.fn().mockResolvedValue([
  {
    id: 1,
    title: "Test Notification",
    message: "Test message",
    type: "INFO",
    read: false,
    link: "/courses/1",
    createdAt: new Date().toISOString(),
  },
]);
const mockMarkAsRead = vi.fn().mockResolvedValue({});
const mockMarkAllAsRead = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/notificationApi", () => ({
  getUnreadCount: () => mockGetUnreadCount(),
  getNotifications: () => mockGetNotifications(),
  markAsRead: (id: number) => mockMarkAsRead(id),
  markAllAsRead: () => mockMarkAllAsRead(),
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUnreadCount.mockResolvedValue(3);
  });

  it("renders bell icon", () => {
    render(<NotificationBell />);
    expect(screen.getByLabelText("通知")).toBeInTheDocument();
  });

  it("shows unread badge after loading", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("opens dropdown on click", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByLabelText("通知"));

    await waitFor(() => {
      expect(screen.getByText("Test Notification")).toBeInTheDocument();
    });
  });

  it("shows empty state when no notifications", async () => {
    mockGetNotifications.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<NotificationBell />);

    await user.click(screen.getByLabelText("通知"));

    await waitFor(() => {
      expect(screen.getByText("通知はありません")).toBeInTheDocument();
    });
  });
});
