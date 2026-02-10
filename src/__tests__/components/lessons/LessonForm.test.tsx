import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import LessonForm from "@/components/lessons/LessonForm";

describe("LessonForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const renderForm = (defaultValues?: { title?: string; contentPath?: string; published?: boolean }) =>
    render(
      <LessonForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="追加"
        defaultValues={defaultValues}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", () => {
    renderForm();
    expect(screen.getByPlaceholderText("レッスンタイトルを入力")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例: /lessons/intro.md")).toBeInTheDocument();
    expect(screen.getByText("公開する")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });

  it("renders with default values", () => {
    renderForm({ title: "Lesson 1", contentPath: "/path.md", published: true });
    expect(screen.getByDisplayValue("Lesson 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("/path.md")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("shows validation error for empty fields", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "追加" }));
    await waitFor(() => {
      expect(screen.getByText("タイトルを入力してください")).toBeInTheDocument();
      expect(screen.getByText("コンテンツパスを入力してください")).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel button clicked", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit with valid data", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByPlaceholderText("レッスンタイトルを入力"), "Lesson Title");
    await user.type(screen.getByPlaceholderText("例: /lessons/intro.md"), "/lesson.md");
    await user.click(screen.getByRole("button", { name: "追加" }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Lesson Title",
          contentPath: "/lesson.md",
        }),
        expect.anything()
      );
    });
  });
});
