"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveAuthToken, saveUserRole } from "@/lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        // show server error details to help debugging
        const errMsg = result?.message ? `${result.message}` : JSON.stringify(result);
        setMessage(errMsg || "Login failed.");
        console.error("Login error response:", result);
        return;
      }

      const accessToken = result.data?.accessToken;
      const role = result.data?.role as string | undefined;

      if (accessToken) {
        saveAuthToken(accessToken);
        saveUserRole(role || "CANDIDATE");

        // redirect based on role; super admin goes to admin dashboard,
        // others go to the app root so user sees a landing/dashboard.
        if (role === "SUPER_ADMIN") {
          window.location.href = "/super-admin";
          return;
        }

        console.info("Login succeeded for role:", role);
        window.location.href = "/";
        return;
      }

      setMessage("Login successful (no access token returned).");
    } catch (error) {
      setMessage("Unable to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-lg shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Login</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Enter your credentials to continue.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {message ? <p className="text-sm text-red-600 dark:text-red-400">{message}</p> : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account? <a className="font-medium text-primary hover:underline" href="/register">Register</a>
        </div>
      </div>
    </div>
  );
}
