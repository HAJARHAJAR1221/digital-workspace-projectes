import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

describe("AuthContext", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, options?: RequestInit) => {
        const path = url.replace(/^https?:\/\/[^/]+/, "");
        if (path.includes("/auth/login") && options?.method === "POST") {
          const body = JSON.parse((options.body as string) || "{}");
          if (body.email === "good@example.com" && body.password === "secret") {
            return Promise.resolve(
              new Response(
                JSON.stringify({
                  token: "fake-jwt",
                  user: {
                    id: "u1",
                    name: "Test User",
                    email: "good@example.com",
                    role: "developer",
                    avatar: "TU"
                  }
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              )
            );
          }
          return Promise.resolve(
            new Response(
              JSON.stringify({ message: "Identifiants invalides" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            )
          );
        }
        if (path.includes("/auth/me")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                id: "u1",
                name: "Test User",
                email: "good@example.com",
                role: "developer",
                avatar: "TU"
              }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            )
          );
        }
        return originalFetch(url as any, options as any);
      })
    );
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("login returns true and sets user when backend returns 200 with token and user", async () => {
    function Helper() {
      const { login, user } = useAuth();
      const [result, setResult] = React.useState<boolean | null>(null);
      return (
        <div>
          <span data-testid="user-email">{user?.email ?? "none"}</span>
          <span data-testid="login-result">{String(result)}</span>
          <button
            type="button"
            onClick={async () => {
              const ok = await login("good@example.com", "secret");
              setResult(ok);
            }}
          >
            Do Login
          </button>
        </div>
      );
    }
    render(
      <AuthProvider>
        <Helper />
      </AuthProvider>
    );
    expect(screen.getByTestId("user-email").textContent).toBe("none");
    await act(async () => {
      fireEvent.click(screen.getByText("Do Login"));
    });
    expect(screen.getByTestId("login-result").textContent).toBe("true");
    expect(screen.getByTestId("user-email").textContent).toBe("good@example.com");
  });

  it("login returns false when backend returns 401", async () => {
    function Helper() {
      const { login, lastLoginError } = useAuth();
      const [result, setResult] = React.useState<boolean | null>(null);
      return (
        <div>
          <span data-testid="login-result">{String(result)}</span>
          <span data-testid="last-error">{lastLoginError ?? "none"}</span>
          <button
            type="button"
            onClick={async () => {
              const ok = await login("bad@example.com", "wrong");
              setResult(ok);
            }}
          >
            Do Login
          </button>
        </div>
      );
    }
    render(
      <AuthProvider>
        <Helper />
      </AuthProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText("Do Login"));
    });
    expect(screen.getByTestId("login-result").textContent).toBe("false");
    expect(screen.getByTestId("last-error").textContent).toBe("Identifiants invalides");
  });
});
