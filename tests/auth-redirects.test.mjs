import test from "node:test";
import assert from "node:assert";

function simulateMiddleware(pathname, isAuthenticated) {
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/studio");

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isProtectedRoute && !isAuthenticated) {
    return { redirect: `/login?redirect=${encodeURIComponent(pathname)}` };
  }

  if (isAuthRoute && isAuthenticated) {
    return { redirect: "/dashboard" };
  }

  return { next: true };
}

test("Middleware blocks unauthenticated access to protected routes", () => {
  const protectedPaths = [
    "/dashboard",
    "/dashboard/audit",
    "/dashboard/studio",
    "/dashboard/networking",
    "/dashboard/roadmap",
    "/onboarding",
    "/audit",
    "/studio",
  ];

  for (const path of protectedPaths) {
    const result = simulateMiddleware(path, false);
    assert.ok(result.redirect, `Path ${path} must redirect when unauthenticated`);
    assert.ok(result.redirect.startsWith("/login?redirect="), `Path ${path} must redirect to login`);
  }
});

test("Middleware allows authenticated access to protected routes", () => {
  const protectedPaths = [
    "/dashboard",
    "/dashboard/audit",
    "/dashboard/studio",
    "/dashboard/networking",
    "/dashboard/roadmap",
    "/onboarding",
  ];

  for (const path of protectedPaths) {
    const result = simulateMiddleware(path, true);
    assert.strictEqual(result.next, true, `Path ${path} must allow access when authenticated`);
  }
});

test("Middleware redirects authenticated users away from /login and /signup", () => {
  assert.strictEqual(simulateMiddleware("/login", true).redirect, "/dashboard");
  assert.strictEqual(simulateMiddleware("/signup", true).redirect, "/dashboard");
});

test("Middleware allows public access to landing page for all users", () => {
  assert.strictEqual(simulateMiddleware("/", false).next, true);
  assert.strictEqual(simulateMiddleware("/", true).next, true);
});
