import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  variant?: "editor" | "article";
};

export default function MarkdownPreview({ content, variant = "editor" }: Props) {
  const isArticle = variant === "article";

  return (
    <div
      className={
        isArticle
          ? "markdown-preview text-gray-800"
          : "markdown-preview min-h-[420px] rounded-b-2xl bg-white px-6 py-6 text-gray-800"
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              className={
                isArticle
                  ? "mb-4 mt-0 border-b border-gray-100 pb-3 text-4xl font-bold text-gray-900"
                  : "mb-4 mt-6 text-4xl font-bold text-gray-900 first:mt-0"
              }
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={
                isArticle
                  ? "mb-4 mt-10 text-2xl font-bold text-gray-900"
                  : "mb-3 mt-6 text-3xl font-semibold text-gray-900"
              }
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={
                isArticle
                  ? "mb-3 mt-8 text-xl font-bold text-gray-900"
                  : "mb-3 mt-5 text-2xl font-semibold text-gray-900"
              }
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={
                isArticle
                  ? "mb-5 text-lg leading-8 text-gray-700"
                  : "mb-4 leading-8 text-gray-700"
              }
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={
                isArticle
                  ? "mb-5 list-disc space-y-2 pl-7 text-lg text-gray-700"
                  : "mb-4 list-disc space-y-2 pl-6"
              }
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={
                isArticle
                  ? "mb-5 list-decimal space-y-2 pl-7 text-lg text-gray-700"
                  : "mb-4 list-decimal space-y-2 pl-6"
              }
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={isArticle ? "leading-8" : "leading-7"}>{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={
                isArticle
                  ? "mb-5 border-l-4 border-green-400 bg-gray-50 px-5 py-3 text-lg italic text-gray-600"
                  : "mb-4 border-l-4 border-gray-300 bg-gray-50 px-4 py-3 italic text-gray-700"
              }
            >
              {children}
            </blockquote>
          ),
          code(props) {
            const { inline, children } = props as {
              inline?: boolean;
              children?: React.ReactNode;
            };

            if (inline) {
              return (
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-pink-600">
                  {children}
                </code>
              );
            }

            return (
              <pre className="mb-5 overflow-x-auto rounded-2xl bg-gray-900 p-5 text-sm text-gray-100">
                <code>{children}</code>
              </pre>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline decoration-blue-400 underline-offset-2 hover:text-blue-800"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="mb-5 overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2">{children}</td>
          ),
          hr: () => <hr className="my-8 border-gray-200" />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt ?? ""}
              className="my-6 max-w-full rounded-2xl"
            />
          ),
        }}
      >
        {content || "Nothing to preview yet..."}
      </ReactMarkdown>
    </div>
  );
}
