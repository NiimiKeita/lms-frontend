import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import StarRating from "@/components/ui/StarRating";

describe("StarRating", () => {
  it("renders correct number of stars", () => {
    render(<StarRating rating={3} />);
    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("highlights correct number of stars based on rating", () => {
    render(<StarRating rating={3} />);
    const stars = screen.getAllByRole("button");
    // First 3 should be filled (yellow-500), last 2 should not
    expect(stars[0].className).toContain("text-yellow-500");
    expect(stars[2].className).toContain("text-yellow-500");
    expect(stars[3].className).toContain("text-foreground/20");
  });

  it("calls onChange when interactive star is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<StarRating rating={0} interactive onChange={handleChange} />);

    await user.click(screen.getByLabelText("4星"));

    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
