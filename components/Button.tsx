import Link from "next/link";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants = {
  primary:
    "bg-zinc-100 text-zinc-950 hover:bg-white focus-visible:outline-zinc-400",
  outline:
    "border border-zinc-600 bg-zinc-900/40 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800/60 focus-visible:outline-zinc-500",
  ghost:
    "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100 focus-visible:outline-zinc-500",
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
