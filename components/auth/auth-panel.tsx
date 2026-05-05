import Link from "next/link";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";

type Props = {
  nextPath: string;
};

export function AuthPanel({ nextPath }: Props) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-500">
          learnwithme
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Sign in
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Continue with Google. If you&apos;re new here, you&apos;ll be guided through a quick profile setup.
        </p>
      </div>

      <GoogleOAuthButton nextPath={nextPath} />

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
        By continuing you agree to our{" "}
        <Link
          href="/conduct"
          className="font-medium text-zinc-700 underline decoration-zinc-400 underline-offset-4 transition hover:text-zinc-900 hover:decoration-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:decoration-zinc-400"
        >
          Code of Conduct
        </Link>
        .
      </p>
    </div>
  );
}
