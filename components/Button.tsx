import Link from "next/link";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-medium transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants = {
  primary:
    "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:outline-neutral-900",
  outline:
    "border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-neutral-400",
  ghost:
    "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus-visible:outline-neutral-400",
} as const;

type Variant = keyof typeof variants;

type Base = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  title?: string;
  "aria-disabled"?: boolean | "true" | "false";
};

type ButtonAsLink = Base & {
  href: string;
};

type ButtonAsButton = Base & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: () => void;
};

export type ButtonProps = ButtonAsLink | ButtonAsButton;

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    className = "",
    disabled,
    title,
    "aria-disabled": ariaDisabled,
  } = props;
  const classes = `${base} ${variants[variant]} ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`.trim();

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes} title={title}>
        {children}
      </Link>
    );
  }

  const { type = "button", onClick } = props as ButtonAsButton;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-disabled={ariaDisabled}
    >
      {children}
    </button>
  );
}
