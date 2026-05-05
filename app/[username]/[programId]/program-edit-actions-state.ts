/**
 * `redirectTo` is set on success so the client can `router.push` — more reliable
 * with `useActionState` than `redirect()` from the action (see Next + React 19).
 */
export type EditProgramBasicsState = {
  formError: string | null;
  redirectTo?: string;
  /** Set with each successful save so client navigation effect runs again for same URL. */
  savedAt?: number;
};

export const editProgramBasicsInitial: EditProgramBasicsState = {
  formError: null,
};
