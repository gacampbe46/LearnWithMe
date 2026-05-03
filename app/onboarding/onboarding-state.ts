export type OnboardingFormState = {
  formError: string | null;
  usernameError: string | null;
  interestsError: string | null;
};

export const onboardingFormInitialState: OnboardingFormState = {
  formError: null,
  usernameError: null,
  interestsError: null,
};

export function mergeOnboardingState(
  partial: Partial<OnboardingFormState>,
): OnboardingFormState {
  return { ...onboardingFormInitialState, ...partial };
}
