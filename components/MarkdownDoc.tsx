"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-4xl"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mb-2 mt-10 text-xl font-semibold text-neutral-900"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mb-2 mt-6 text-base font-semibold text-neutral-900"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 text-base leading-relaxed text-neutral-600" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="mb-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-neutral-600"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mb-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-neutral-600"
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
    <strong className="font-medium text-neutral-800" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-neutral-600" {...props}>
      {children}
    </em>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
      {...props}
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-8 border-neutral-200" />,
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full min-w-[20rem] border-collapse text-left text-sm text-neutral-600">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-neutral-200 bg-neutral-50">{children}</thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-700"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-b border-neutral-100 px-3 py-2 align-top" {...props}>
      {children}
    </td>
  ),
};

type MarkdownDocProps = {
  source: string;
};

export function MarkdownDoc({ source }: MarkdownDocProps) {
  return (
    <div className="[&_h2+h3]:mt-4 [&_li>p]:mb-1 [&_li>p:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
