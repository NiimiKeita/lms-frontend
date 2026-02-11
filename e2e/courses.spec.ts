import { test, expect } from "@playwright/test";

test.describe("Course Browsing (Authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting localStorage tokens before navigation
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("accessToken", "test-token");
      localStorage.setItem("refreshToken", "test-refresh-token");
    });
  });

  test("should show forgot password page", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", { name: "パスワードリセット" })
    ).toBeVisible();
  });

  test("should have navigation links on login page", async ({ page }) => {
    await page.goto("/login");
    const registerLink = page.getByRole("link", { name: "アカウント登録" });
    await expect(registerLink).toBeVisible();
  });

  test("should show forgot password link on login page", async ({ page }) => {
    await page.goto("/login");
    const forgotLink = page.getByRole("link", {
      name: "パスワードをお忘れですか？",
    });
    await expect(forgotLink).toBeVisible();
  });
});

test.describe("Admin Course Management", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/admin/courses/new");
    await expect(page).toHaveURL(/\/login/);
  });
});
