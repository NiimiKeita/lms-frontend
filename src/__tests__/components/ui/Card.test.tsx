import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Card from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies default styling", () => {
    const { container } = render(<Card><p>test</p></Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("bg-background");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("shadow-sm");
  });

  it("accepts custom className", () => {
    const { container } = render(<Card className="!p-4"><p>test</p></Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("!p-4");
  });
});
