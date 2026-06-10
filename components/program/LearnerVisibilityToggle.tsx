import { captionClass, labelStrongSmClass } from "@/lib/ui/typography";

type LearnerVisibilityToggleProps = {
  isActive: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Shown under the label when the toggle is disabled. */
  lockedReason?: string;
  /** Shown when off but the toggle is interactive (e.g. draft with sessions). */
  inactiveHelperText?: string;
  /** When set, syncs toggle state into a hidden form field. */
  formFieldName?: string;
  error?: string | null;
};

export function LearnerVisibilityToggle({
  isActive,
  onChange,
  disabled = false,
  lockedReason,
  inactiveHelperText,
  formFieldName,
  error,
}: LearnerVisibilityToggleProps) {
  const helperText = disabled && lockedReason
    ? lockedReason
    : isActive
      ? "Users can see this program on your profile."
      : inactiveHelperText ??
        "Users won\u2019t see this program until you turn this on.";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={labelStrongSmClass}>User visibility</p>
          <p className={`mt-0.5 ${captionClass}`}>{helperText}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {formFieldName ? (
            <input
              type="hidden"
              name={formFieldName}
              value={isActive ? "true" : "false"}
            />
          ) : null}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(!isActive)}
            className={`relative h-5 w-[2rem] shrink-0 rounded-full transition-colors outline-none ring-offset-2 focus-visible:ring-2 enabled:cursor-pointer disabled:opacity-60 dark:ring-offset-background ${
              isActive
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 focus-visible:ring-emerald-500/45 dark:bg-emerald-600/35 dark:hover:bg-emerald-600/45 dark:focus-visible:ring-emerald-500/55"
                : "bg-stone-300 hover:bg-stone-400 focus-visible:ring-stone-400 dark:bg-stone-600 dark:hover:bg-stone-500 dark:focus-visible:ring-stone-500"
            }`}
            role="switch"
            aria-checked={isActive}
            aria-label={
              isActive ? "Hide program from users" : "Show program to users"
            }
          >
            <span
              className={`pointer-events-none absolute left-[3px] top-[3px] block size-[0.8125rem] rounded-full bg-white shadow-sm ring-1 transition-transform dark:bg-stone-50 ${
                isActive
                  ? "translate-x-[0.6875rem] ring-emerald-600/20 dark:ring-emerald-400/35"
                  : "translate-x-0 ring-black/10 dark:ring-white/20"
              }`}
              aria-hidden
            />
          </button>
          {error ? (
            <p
              role="alert"
              className="max-w-[14rem] text-right text-xs leading-snug text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
