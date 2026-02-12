import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Input from "@/components/ui/Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Input label="Email" error="Required field" />);
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("applies error styling when error is present", () => {
    render(<Input label="Email" error="Invalid" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-500");
  });

  it("does not show error styling without error", () => {
    render(<Input label="Email" />);
    const input = screen.getByRole("textbox");
    expect(input.className).not.toContain("border-red-500");
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    const input = screen.getByRole("textbox");
    await user.type(input, "John");
    expect(input).toHaveValue("John");
  });

  it("renders with placeholder", () => {
    render(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });
});
