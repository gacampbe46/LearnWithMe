"use client";

import {
  bodyLeadClass,
  proseStrongClass,
  textLinkUnderlineClass,
  titleDisplayClass,
  titleSmallClass,
  titleSubsectionClass,
} from "@/lib/ui/typography";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className={`mb-4 leading-tight ${titleDisplayClass}`} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className={`mb-2 mt-10 ${titleSubsectionClass}`} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className={`mb-2 mt-6 ${titleSmallClass}`} {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className={`mb-4 ${bodyLeadClass}`} {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className={`mb-4 list-disc space-y-2 pl-5 ${bodyLeadClass}`} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className={`mb-4 list-decimal space-y-2 pl-5 ${bodyLeadClass}`} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className={proseStrongClass} {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-zinc-600 dark:text-zinc-400" {...props}>
      {children}
    </em>
  ),
  a: ({ children, href, ...props }) => (
    <a href={href} className={textLinkUnderlineClass} {...props}>
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
