import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
    await expect(page.getByLabel("メールアドレス")).toBeVisible();
    await expect(page.getByLabel("パスワード")).toBeVisible();
  });

  test("should show register page", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "アカウント登録" })
    ).toBeVisible();
  });

  test("should navigate from login to register", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "アカウント登録" }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("should show validation errors on empty login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page.locator("text=メールアドレスを入力してください").or(page.locator("[role='alert']"))).toBeVisible();
  });

  test("should redirect unauthenticated user to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
