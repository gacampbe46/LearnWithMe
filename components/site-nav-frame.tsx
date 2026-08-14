import { SiteNavChrome } from "@/components/site-nav";
import { getNavAccount } from "@/lib/auth/nav-account";

export function SiteNavFallback() {
  return <SiteNavChrome account={undefined} />;
}

export async function SiteNav() {
  const account = await getNavAccount();
  return <SiteNavChrome account={account} />;
}
