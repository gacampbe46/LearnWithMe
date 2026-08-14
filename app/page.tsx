import { HomePage } from "@/components/home/HomePage";
import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
import { resolveHomeSampleContent } from "@/lib/home/resolve-home-sample";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const [{ options: interestTags, error: tagsLoadError }, sample] =
    await Promise.all([
      listInterestTagOptions(supabase),
      resolveHomeSampleContent(),
    ]);

  return (
    <HomePage
      interestTags={interestTags}
      tagsLoadError={tagsLoadError}
      sample={sample}
    />
  );
}
