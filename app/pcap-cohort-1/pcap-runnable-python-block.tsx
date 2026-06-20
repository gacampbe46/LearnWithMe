"use client";

import { useState } from "react";

function PythonLine({ line }: { line: string }) {
  const parts = line.split(
    /(\b(?:append|bool|dir|float|input|int|len|list|max|min|print|range|sorted|str|sum|type)\b|\b\d+(?:\.\d+)?\b|".*?"|'.*?'|#.*$)/g,
  );

  return (
    <>
      {parts.map((part, idx) => {
        if (
          /^(append|bool|dir|float|input|int|len|list|max|min|print|range|sorted|str|sum|type)$/.test(
            part,
          )
        ) {
          return (
            <span key={idx} className="text-sky-300">
              {part}
            </span>
          );
        }
        if (/^\d+(?:\.\d+)?$/.test(part)) {
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
        if (/^#/.test(part)) {
          return (
            <span key={idx} className="text-stone-500">
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

export function PcapRunnablePythonBlock({
  code,
  output,
  label = "python",
}: {
  code: string;
  output?: string | null;
  label?: string;
}) {
  const [showOutput, setShowOutput] = useState(false);
  const hasOutput = Boolean(output?.trim());

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-700/70 bg-[#111827] shadow-inner shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="font-mono text-[11px] text-stone-400">{label}</span>
        </div>
        {hasOutput ? (
          <button
            type="button"
            onClick={() => setShowOutput((value) => !value)}
            className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-stone-100 transition hover:border-emerald-300/70 hover:text-emerald-100"
          >
            {showOutput ? "Hide output" : "Run"}
          </button>
        ) : null}
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-7 text-stone-100">
        <code>
          {code.split("\n").map((line, idx) => (
            <span key={`${line}-${idx}`} className="block">
              <span className="mr-4 select-none text-stone-500">{idx + 1}</span>
              <PythonLine line={line} />
            </span>
          ))}
        </code>
      </pre>
      {showOutput && hasOutput ? (
        <div className="border-t border-white/10 bg-black/25 px-4 py-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-200">
              Output
            </p>
            <p className="text-[11px] text-stone-500">stored expected output</p>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-emerald-100">
            {output}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
