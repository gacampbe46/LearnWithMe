function PythonLine({ line }: { line: string }) {
  const parts = line.split(/(\b(?:append|print|len|bool)\b|\b\d+\b|".*?"|'.*?')/g);

  return (
    <>
      {parts.map((part, idx) => {
        if (/^(append|print|len|bool)$/.test(part)) {
          return (
            <span key={idx} className="text-sky-300">
              {part}
            </span>
          );
        }
        if (/^\d+$/.test(part)) {
          return (
            <span key={idx} className="text-amber-300">
              {part}
            </span>
          );
        }
        if (/^["'].*["']$/.test(part)) {
          return (
            <span key={idx} className="text-emerald-300">
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

export function PcapQuestionPrompt({ prompt }: { prompt: string }) {
  const [intro, code] = prompt.split("\n\n");

  if (!code) {
    return (
      <p className="whitespace-pre-line text-base leading-relaxed text-stone-800 dark:text-stone-200">
        {prompt}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-base leading-relaxed text-stone-800 dark:text-stone-200">
        {intro}
      </p>
      <div className="overflow-hidden rounded-2xl border border-stone-700/70 bg-[#111827] shadow-inner shadow-black/30">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="font-mono text-[11px] text-stone-400">
            python
          </span>
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-7 text-stone-100">
          <code>
            {code.split("\n").map((line, idx) => (
              <span key={`${line}-${idx}`} className="block">
                <span className="mr-4 select-none text-stone-500">
                  {idx + 1}
                </span>
                <PythonLine line={line} />
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
