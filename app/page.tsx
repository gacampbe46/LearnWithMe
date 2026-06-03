import { HomePage } from "@/components/home/HomePage";
import { listInterestTagOptions } from "@/lib/catalog/interest-tags";
import { resolveHomeKathleenContent } from "@/lib/home/resolve-home-kathleen";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const [{ options: interestTags, error: tagsLoadError }, kathleen] =
    await Promise.all([
      listInterestTagOptions(supabase),
      resolveHomeKathleenContent(),
    ]);

  return (
    <HomePage
      interestTags={interestTags}
      tagsLoadError={tagsLoadError}
      kathleen={kathleen}
    />
  );
}
