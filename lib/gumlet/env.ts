export function getGumletApiKey(): string | undefined {
  const value = process.env.GUMLET_API_KEY?.trim();
  return value || undefined;
}

export function getGumletWorkspaceId(): string | undefined {
  const value = process.env.GUMLET_WORKSPACE_ID?.trim();
  return value || undefined;
}

export function getGumletWebhookSecret(): string | undefined {
  const value = process.env.GUMLET_WEBHOOK_SECRET?.trim();
  return value || undefined;
}
