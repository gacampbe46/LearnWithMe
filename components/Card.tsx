type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-5 shadow-sm shadow-black/20 backdrop-blur-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
