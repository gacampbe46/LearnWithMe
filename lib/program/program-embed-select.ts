/** Nested `programs` rows: scalar `tags` JSON + sessions embed. */
export const PROGRAM_CHILDREN_EMBED_FIELDS = `
  id,
  title,
  description,
  price,
  created_at,
  is_active,
  profile_id,
  tags,
  sessions(id, title, description, instructions, content_url, sort_order)
`.replace(/\s+/g, " ");

/**
 * Legacy alias: previously omitted a broken `programs→tags` relation embed.
 * The `tags` column is always scalar JSON on `programs`; keep identical select.
 */
export const PROGRAM_CHILDREN_EMBED_NO_TAGS = PROGRAM_CHILDREN_EMBED_FIELDS;
