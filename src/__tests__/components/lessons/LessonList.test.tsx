import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import LessonList from "@/components/lessons/LessonList";
import type { Lesson } from "@/types/course";

// Mock courseApi
vi.mock("@/lib/courseApi", () => ({
  createLesson: vi.fn(),
  updateLesson: vi.fn(),
  deleteLesson: vi.fn(),
}));

const mockLessons: Lesson[] = [
  {
    id: 1,
    courseId: 1,
    title: "Lesson 1",
    contentPath: "/path1.md",
    sortOrder: 1,
    published: true,
    createdAt: "2025-01-01T00:00:00",
    updatedAt: "2025-01-01T00:00:00",
  },
  {
    id: 2,
    courseId: 1,
    title: "Lesson 2",
    contentPath: "/path2.md",
    sortOrder: 2,
    published: false,
    createdAt: "2025-01-02T00:00:00",
    updatedAt: "2025-01-02T00:00:00",
  },
];

describe("LessonList", () => {
  const mockOnLessonsChange = vi.fn();

  it("renders lesson titles", () => {
    render(
      <LessonList
        courseId={1}
        lessons={mockLessons}
        isAdmin={false}
        onLessonsChange={mockOnLessonsChange}
      />
    );
    expect(screen.getByText("Lesson 1")).toBeInTheDocument();
    expect(screen.getByText("Lesson 2")).toBeInTheDocument();
  });

  it("shows publish status badges", () => {
    render(
      <LessonList
        courseId={1}
        lessons={mockLessons}
        isAdmin={false}
        onLessonsChange={mockOnLessonsChange}
      />
    );
    expect(screen.getByText("公開")).toBeInTheDocument();
    expect(screen.getByText("非公開")).toBeInTheDocument();
  });

  it("shows add button for admin", () => {
    render(
      <LessonList
        courseId={1}
        lessons={mockLessons}
        isAdmin={true}
        onLessonsChange={mockOnLessonsChange}
      />
    );
    expect(screen.getByRole("button", { name: "レッスン追加" })).toBeInTheDocument();
  });

  it("hides add button for non-admin", () => {
    render(
      <LessonList
        courseId={1}
        lessons={mockLessons}
        isAdmin={false}
        onLessonsChange={mockOnLessonsChange}
      />
    );
    expect(screen.queryByRole("button", { name: "レッスン追加" })).not.toBeInTheDocument();
  });

  it("expands lesson details on click", async () => {
    const user = userEvent.setup();
    render(
      <LessonList
        courseId={1}
        lessons={mockLessons}
        isAdmin={false}
        onLessonsChange={mockOnLessonsChange}
      />
    );
    await user.click(screen.getByText("Lesson 1"));
    expect(screen.getByText("/path1.md")).toBeInTheDocument();
  });

  it("shows edit/delete buttons for admin in expanded view", async () => {
    const user = userEvent.setup();
    render(
      <LessonList
        courseId={1}
        lessons={mockLessons}
        isAdmin={true}
        onLessonsChange={mockOnLessonsChange}
      />
    );
    await user.click(screen.getByText("Lesson 1"));
    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("shows empty state when no lessons", () => {
    render(
      <LessonList
        courseId={1}
        lessons={[]}
        isAdmin={false}
        onLessonsChange={mockOnLessonsChange}
      />
    );
    expect(screen.getByText("レッスンはまだありません")).toBeInTheDocument();
  });
});
