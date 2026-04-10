"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mb-2 mt-10 text-xl font-semibold text-zinc-900 dark:text-zinc-100"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mb-2 mt-6 text-base font-semibold text-zinc-900 dark:text-zinc-100"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="mb-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-600 dark:text-zinc-400"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mb-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-zinc-600 dark:text-zinc-400"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-medium text-zinc-800 dark:text-zinc-200" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-zinc-600 dark:text-zinc-400" {...props}>
      {children}
    </em>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition hover:text-zinc-950 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:text-zinc-50 dark:hover:decoration-zinc-300"
      {...props}
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-8 border-zinc-200 dark:border-zinc-800" />,
};

type ConductMarkdownProps = {
  source: string;
};

export function ConductMarkdown({ source }: ConductMarkdownProps) {
  return (
    <div className="[&_h2+h3]:mt-4 [&_li>p]:mb-1 [&_li>p:last-child]:mb-0">
      <ReactMarkdown components={components}>{source}</ReactMarkdown>
    </div>
  );
}
