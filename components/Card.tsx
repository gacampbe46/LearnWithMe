type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-editorial-border bg-editorial-card p-5 shadow-sm shadow-stone-900/5 dark:shadow-black/20 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
