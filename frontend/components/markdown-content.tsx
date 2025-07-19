import ReactMarkdown from "react-markdown"
import { Zap, Activity } from "lucide-react"

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 mt-4 first:mt-0 flex items-center gap-2 text-right">
            <Zap className="w-4 h-4 text-purple-600" />
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-2 mt-3 first:mt-0 flex items-center gap-2 text-right">
            <Activity className="w-3 h-3 text-purple-500" />
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-2 mt-2 first:mt-0 text-right">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 last:mb-0 leading-relaxed text-right">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="text-sm text-slate-700 dark:text-slate-300 mb-3 pr-4 list-disc space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-right">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="text-sm text-slate-700 dark:text-slate-300 mb-3 pr-4 list-decimal space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-right">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="text-sm text-slate-700 dark:text-slate-300 text-right">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900 dark:text-slate-100 bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">
            {children}
          </strong>
        ),
        em: ({ children }) => <em className="italic text-slate-800 dark:text-slate-200">{children}</em>,
        code: ({ children }) => (
          <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-800 dark:text-slate-200">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto mb-3 border border-slate-200 dark:border-slate-700">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-r-4 border-blue-300 dark:border-blue-600 pr-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-sm text-slate-700 dark:text-slate-300 italic mb-3 rounded-lg text-right">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-slate-200 dark:border-slate-700 my-4" />,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-200 dark:decoration-blue-600 hover:decoration-blue-400 dark:hover:decoration-blue-500 transition-colors"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
