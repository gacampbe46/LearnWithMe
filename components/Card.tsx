type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-5 shadow-sm shadow-zinc-900/5 backdrop-blur-sm dark:border-zinc-800/90 dark:bg-zinc-900/50 dark:shadow-black/20 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
