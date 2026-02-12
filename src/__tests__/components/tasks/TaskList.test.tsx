import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskList from "@/components/tasks/TaskList";
import type { Task } from "@/types/task";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock taskApi
vi.mock("@/lib/taskApi", () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockTasks: Task[] = [
  {
    id: 1,
    courseId: 1,
    title: "Task 1",
    description: "Description 1",
    sortOrder: 1,
    createdAt: "2025-01-01T00:00:00",
    updatedAt: "2025-01-01T00:00:00",
  },
  {
    id: 2,
    courseId: 1,
    title: "Task 2",
    description: null,
    sortOrder: 2,
    createdAt: "2025-01-02T00:00:00",
    updatedAt: "2025-01-02T00:00:00",
  },
];

describe("TaskList", () => {
  const mockOnTasksChange = vi.fn();

  it("renders task titles", () => {
    render(
      <TaskList
        courseId={1}
        tasks={mockTasks}
        isAdmin={false}
        isEnrolled={true}
        onTasksChange={mockOnTasksChange}
      />
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("shows add button for admin", () => {
    render(
      <TaskList
        courseId={1}
        tasks={mockTasks}
        isAdmin={true}
        isEnrolled={false}
        onTasksChange={mockOnTasksChange}
      />
    );
    expect(screen.getByRole("button", { name: "課題追加" })).toBeInTheDocument();
  });

  it("hides add button for non-admin", () => {
    render(
      <TaskList
        courseId={1}
        tasks={mockTasks}
        isAdmin={false}
        isEnrolled={true}
        onTasksChange={mockOnTasksChange}
      />
    );
    expect(screen.queryByRole("button", { name: "課題追加" })).not.toBeInTheDocument();
  });

  it("expands task details on click", async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        courseId={1}
        tasks={mockTasks}
        isAdmin={false}
        isEnrolled={true}
        onTasksChange={mockOnTasksChange}
      />
    );
    await user.click(screen.getByText("Task 1"));
    expect(screen.getByText("Description 1")).toBeInTheDocument();
  });

  it("shows submit button for enrolled users in expanded view", async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        courseId={1}
        tasks={mockTasks}
        isAdmin={false}
        isEnrolled={true}
        onTasksChange={mockOnTasksChange}
      />
    );
    await user.click(screen.getByText("Task 1"));
    expect(screen.getByRole("button", { name: "提出する" })).toBeInTheDocument();
  });

  it("shows edit/delete buttons for admin in expanded view", async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        courseId={1}
        tasks={mockTasks}
        isAdmin={true}
        isEnrolled={false}
        onTasksChange={mockOnTasksChange}
      />
    );
    await user.click(screen.getByText("Task 1"));
    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("shows empty state when no tasks", () => {
    render(
      <TaskList
        courseId={1}
        tasks={[]}
        isAdmin={false}
        isEnrolled={true}
        onTasksChange={mockOnTasksChange}
      />
    );
    expect(screen.getByText("課題はまだありません")).toBeInTheDocument();
  });

  it("sorts tasks by sortOrder", () => {
    const unorderedTasks: Task[] = [
      { ...mockTasks[1], sortOrder: 2 },
      { ...mockTasks[0], sortOrder: 1 },
    ];
    render(
      <TaskList
        courseId={1}
        tasks={unorderedTasks}
        isAdmin={false}
        isEnrolled={false}
        onTasksChange={mockOnTasksChange}
      />
    );
    const titles = screen.getAllByText(/Task \d/);
    expect(titles[0]).toHaveTextContent("Task 1");
    expect(titles[1]).toHaveTextContent("Task 2");
  });
});
