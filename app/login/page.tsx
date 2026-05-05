import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = {
  title: "Sign in — learnwithme",
  description: "Sign in to learnwithme with Google (new accounts use the same sign-in flow).",
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const showConfigError = params.error === "config";
  const showAuthError = params.error === "auth";

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        {(showConfigError || showAuthError) && (
          <div
            role="alert"
            className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          >
            {showConfigError
              ? "Authentication is not configured. Check environment variables."
              : "Something went wrong signing you in. Try again."}
          </div>
        )}
        <AuthPanel />
      </main>
    </div>
  );
}
