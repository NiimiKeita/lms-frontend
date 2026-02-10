import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskForm from "@/components/tasks/TaskForm";

describe("TaskForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const renderForm = (defaultValues?: { title?: string; description?: string }) =>
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="作成"
        defaultValues={defaultValues}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", () => {
    renderForm();
    expect(screen.getByPlaceholderText("課題タイトルを入力")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("課題の説明を入力")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("renders with default values", () => {
    renderForm({ title: "Test Task", description: "Description" });
    expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Description")).toBeInTheDocument();
  });

  it("shows validation error for empty title", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "作成" }));
    await waitFor(() => {
      expect(screen.getByText("タイトルを入力してください")).toBeInTheDocument();
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
    await user.type(screen.getByPlaceholderText("課題タイトルを入力"), "New Task");
    await user.click(screen.getByRole("button", { name: "作成" }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: "New Task" }),
        expect.anything()
      );
    });
  });
});
