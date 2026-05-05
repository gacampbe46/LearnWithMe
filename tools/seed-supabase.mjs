import { createClient } from "@supabase/supabase-js";

const seedMember = {
  username: "kathleen",
  firstName: "Kathleen",
  lastName: "",
  bio: "Focused on efficient, repeatable workouts you can follow anywhere",
  tagline:
    "Theraband sessions, Pilates-style full-body work, and simple training that fits your life",
  profileViewPreference: "full_content",
  channelUrl: "https://www.youtube.com/@kathleenchu",
  whatYouNeed: [
    "A theraband (resistance band) for the full-body Theraband sample",
    "A small Pilates ball for the beginner Pilates-style sample",
    "Clear floor space; a mat is nice to have",
  ],
  featuredPreviewVideos: [
    {
      videoId: "QvWW6M17CLw",
      title: "50 MINUTE | Full Body | Theraband",
    },
    {
      videoId: "aUv8WuNhZq0",
      title: "36 MINUTE | Beginner Full Body | Small Pilates Ball",
    },
  ],
  program: {
    title: "Foundation Program",
    description: "Three guided sessions — one simple price for the whole program",
    price: 12,
    topicTagNames: ["Fitness", "Yoga"],
    sessions: [
      {
        title: "Day 1 — 20 MINUTE | Express Glutes & Inner Thigh Focus | Ankle Weights",
        description:
          "Short, focused lower-body session targeting glutes and inner thighs; ankle weights optional.",
        contentUrl: "YDXB0N0eAwc",
        instructions: "Full session — follow along in the video",
      },
      {
        title: "Day 2 — 26 MINUTE | Full Body Express | Optional Ankle Weights",
        description:
          "Efficient full-body express class; add ankle weights only if it still feels controlled.",
        contentUrl: "QPLAqXiWa6Y",
        instructions: "Full session — follow along in the video",
      },
      {
        title: "Day 3 — Twist & Rotate | 47 min | Small Pilates Ball",
        description:
          "Longer rotation-focused Pilates-style session using a small ball for feedback and control.",
        contentUrl: "QfHHsTar1LI",
        instructions: "Full session — follow along in the video",
      },
    ],
  },
};

function mustGetEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

async function upsertProfile(supabase, profileTagIds) {
  const username = seedMember.username;
  const seedUserId = process.env.SEED_PROFILE_USER_ID || null;

  const { data: existing, error: existingError } = await supabase
    .from("profile")
    .select("id, user_id")
    .eq("username", username)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing && !seedUserId) {
    throw new Error(
      "No profile found for username and SEED_PROFILE_USER_ID is not set. Set SEED_PROFILE_USER_ID to an existing auth.users.id.",
    );
  }

  const payload = {
    username,
    user_id: existing?.user_id ?? seedUserId,
    bio: seedMember.bio,
    first_name: seedMember.firstName,
    last_name: seedMember.lastName,
    links: {
      channelUrl: seedMember.channelUrl,
      hubLinks: [
        { label: "View Foundation Program", href: `/${username}` },
        {
          label: "YouTube channel",
          href: seedMember.channelUrl,
          external: true,
        },
      ],
    },
    tags: {
      tagline: seedMember.tagline,
      profileViewPreference: seedMember.profileViewPreference,
      whatYouNeed: seedMember.whatYouNeed,
      featuredPreviewVideos: seedMember.featuredPreviewVideos,
      ...(profileTagIds.length > 0 ? { tagIds: profileTagIds } : {}),
    },
    is_instructor: true,
    type: "creator",
  };

  const { data: profile, error } = await supabase
    .from("profile")
    .upsert(payload, { onConflict: "username" })
    .select("id")
    .single();

  if (error) throw error;
  return profile.id;
}

/** Resolve catalog UUIDs from `public.tags.name` for program topic chips. */
async function fetchTagIdsForProgramTopics(supabase, names) {
  const trimmed = names.map((n) => String(n).trim()).filter(Boolean);
  if (trimmed.length === 0) return [];

  const { data, error } = await supabase.from("tags").select("id, name");
  if (error) throw error;

  const byLower = new Map();
  for (const row of data ?? []) {
    const label = typeof row.name === "string" ? row.name.trim() : "";
    if (!label || typeof row.id !== "string") continue;
    byLower.set(label.toLowerCase(), row.id);
  }

  const ids = [];
  const matchedNames = [];
  const missing = [];
  for (const name of trimmed) {
    const id = byLower.get(name.toLowerCase());
    if (id) {
      ids.push(id);
      matchedNames.push(name);
    } else missing.push(name);
  }

  if (matchedNames.length > 0) {
    console.log(`Seed: matched catalog tags → ${matchedNames.join(", ")}`);
  }

  if (missing.length > 0) {
    console.warn(
      `Seed: program topic tag name(s) not in public.tags (skipped): ${missing.join(", ")}`,
    );
    console.warn(
      "Seed: set SEED_PROGRAM_TOPIC_TAG_NAMES to comma-separated names that exist in your catalog, or edit seedMember.program.topicTagNames.",
    );
  }

  return ids;
}

/** When unset, uses `seedMember.program.topicTagNames`. Set to empty string to skip tags. */
function programTopicNamesForSeed() {
  if (process.env.SEED_PROGRAM_TOPIC_TAG_NAMES !== undefined) {
    return process.env.SEED_PROGRAM_TOPIC_TAG_NAMES.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return seedMember.program.topicTagNames ?? [];
}

async function upsertProgram(supabase, profileId, topicNames, topicIds) {
  const { data: existing, error: existingError } = await supabase
    .from("programs")
    .select("id")
    .eq("profile_id", profileId)
    .eq("title", seedMember.program.title)
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;

  const payload = {
    profile_id: profileId,
    title: seedMember.program.title,
    description: seedMember.program.description,
    price: seedMember.program.price,
    is_active: true,
  };

  if (topicNames.length > 0) {
    payload.tags = topicIds.length > 0 ? { tagIds: topicIds } : null;
  }

  if (existing) {
    const { error } = await supabase.from("programs").update(payload).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data: inserted, error } = await supabase
    .from("programs")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
}

async function replaceSessions(supabase, programId) {
  const { error: deleteError } = await supabase.from("sessions").delete().eq("program_id", programId);
  if (deleteError) throw deleteError;

  const rows = seedMember.program.sessions.map((session, index) => ({
    program_id: programId,
    title: session.title,
    description: session.description,
    instructions: session.instructions,
    content_url: session.contentUrl,
    sort_order: index,
  }));

  const { error: insertError } = await supabase.from("sessions").insert(rows);
  if (insertError) throw insertError;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
    mustGetEnv("SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(
    supabaseUrl || process.env.SUPABASE_URL,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const topicNames = programTopicNamesForSeed();
  const topicIds = await fetchTagIdsForProgramTopics(supabase, topicNames);

  const profileId = await upsertProfile(supabase, topicIds);
  const programId = await upsertProgram(supabase, profileId, topicNames, topicIds);
  await replaceSessions(supabase, programId);

  console.log("Seed complete.");
  console.log({
    profileId,
    programId,
    sessionCount: seedMember.program.sessions.length,
    programTopicTagCount: topicIds.length,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
