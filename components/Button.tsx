import Link from "next/link";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variants = {
  primary:
    "bg-stone-900 text-stone-50 hover:bg-stone-800 focus-visible:outline-stone-500 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white dark:focus-visible:outline-stone-400",
  outline:
    "border border-stone-800 bg-editorial-card/50 text-stone-900 hover:border-editorial-accent-muted hover:bg-stone-900/5 focus-visible:outline-editorial-accent-muted dark:border-stone-300 dark:bg-editorial-card/40 dark:text-stone-100 dark:hover:border-editorial-accent dark:hover:bg-stone-800/40 dark:focus-visible:outline-stone-500",
  ghost:
    "text-stone-600 hover:bg-stone-200/80 hover:text-stone-900 focus-visible:outline-editorial-accent-muted dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-100 dark:focus-visible:outline-stone-500",
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
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
};

type ButtonAsButton = Base & {
  href?: undefined;
  type?: "button" | "submit";
  /** Associate submit with a `<form id="…">` outside this tree. */
  form?: string;
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
    const link = props as ButtonAsLink;
    return (
      <Link
        href={link.href}
        className={classes}
        title={title}
        target={link.target}
        rel={link.rel}
      >
        {children}
      </Link>
    );
  }

  const { type = "button", form, onClick } = props as ButtonAsButton;

  return (
    <button
      type={type}
      form={form}
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
