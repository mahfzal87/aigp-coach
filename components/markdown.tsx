import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// Element overrides for what `.prose-note` (globals.css) does not cover:
// ordered lists (Tailwind's preflight strips their numbers), GFM tables (scroll
// inside themselves instead of widening the page), external links (new tab).
const components: Components = {
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//i.test(href);
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  ol: ({ children, start }) => (
    <ol start={start} className="my-[0.55em] list-decimal pl-[1.35em] marker:font-semibold marker:text-[var(--muted)]">
      {children}
    </ol>
  ),
  table: ({ children }) => (
    <div className="my-3 max-w-full overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full border-collapse text-left text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-[var(--border)] px-3 py-2 align-top">{children}</td>,
  blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-[var(--border)] pl-3 text-[var(--muted)]">{children}</blockquote>,
  pre: ({ children }) => <pre className="my-3 max-w-full overflow-x-auto rounded-lg bg-[var(--surface-2)] p-3 text-[12.5px]">{children}</pre>,
  hr: () => <hr className="my-4 border-[var(--border)]" />,
};

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    // First/last block margins trimmed so cards keep even padding (`!` because the
    // `.prose-note p` margins in globals.css sit outside a cascade layer).
    <div className={cn("prose-note text-sm [&>:first-child]:mt-0! [&>:last-child]:mb-0!", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
