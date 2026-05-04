import { Button } from "@/components/Button";
import { HomeAccountMenu } from "@/components/home/home-account-menu";
import { getNavAccount } from "@/lib/auth/nav-account";

export function HomeAccountFallback() {
  return (
    <div
      className="h-10 min-w-[5.5rem] animate-pulse rounded-full bg-zinc-200/90 dark:bg-zinc-800"
      aria-hidden
    />
  );
}

export async function HomeAccountControl() {
  const account = await getNavAccount();

  if (!account) {
    return (
      <Button href="/login" variant="outline" className="min-h-10 px-5 text-sm">
        Sign in
      </Button>
    );
  }

  return (
    <HomeAccountMenu
      displayName={account.displayName}
      profilePath={account.profilePath}
      teachNewProgramHref={account.teachNewProgramHref}
      avatarUrl={account.avatarUrl}
    />
  );
}
