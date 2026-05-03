import ReactMarkdown from "react-markdown";
import { useRef, type CSSProperties } from "react";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { markdownSanitizeSchema } from "@/features/markdown-editor/lib/markdown-sanitize-schema";
import { cn } from "@/shared/lib/cn";
import EditorResizablePreviewImage from "@/features/markdown-editor/ui/editor-resizable-preview-image";

type Props = {
  content: string;
  variant?: "editor" | "article";
  /**
   * 完整预览里，正文 `content` 之前的片段中出现的图片数量（用于把预览中第 n 张图映射到正文里的第 n - offset 张）。
   */
  previewBodyImageOffset?: number;
  /** 仅在 variant=editor 且传入时：拖拽预览图后回写正文 */
  onPreviewBodyImageResize?: (bodyImageIndex: number, widthPx: number) => void;
};

function toPxCssSize(value: number | string | undefined) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${Math.round(value)}px`;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return `${Number(value.trim())}px`;
  }
  return null;
}

function mergeImageStyle(
  style: CSSProperties | undefined,
  width: number | string | undefined,
  height: number | string | undefined,
): CSSProperties | undefined {
  const widthPx = toPxCssSize(width);
  const heightPx = toPxCssSize(height);
  if (!style && !widthPx && !heightPx) return undefined;

  return {
    ...style,
    ...(widthPx ? { width: widthPx } : {}),
    ...(heightPx ? { height: heightPx } : {}),
  };
}

export default function MarkdownPreview({
  content,
  variant = "editor",
  previewBodyImageOffset = 0,
  onPreviewBodyImageResize,
}: Props) {
  const isArticle = variant === "article";
  const imgSeqRef = useRef(0);
  imgSeqRef.current = 0;

  const useResize = variant === "editor" && Boolean(onPreviewBodyImageResize);

  return (
    <div
      className={
        isArticle
          ? "markdown-preview text-olive"
          : "markdown-preview min-h-[420px] rounded-b-3xl bg-ivory px-6 py-6 text-olive"
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]]}
        components={{
          h1: ({ children }) => (
            <h1
              className={
                isArticle
                  ? "font-editorial mb-4 mt-0 border-b border-border-cream pb-3 text-4xl font-medium text-ink"
                  : "font-editorial mb-4 mt-6 text-4xl font-medium text-ink first:mt-0"
              }
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={
                isArticle
                  ? "font-editorial mb-4 mt-10 text-2xl font-medium text-ink"
                  : "font-editorial mb-3 mt-6 text-3xl font-medium text-ink"
              }
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={
                isArticle
                  ? "font-editorial mb-3 mt-8 text-xl font-medium text-ink"
                  : "font-editorial mb-3 mt-5 text-2xl font-medium text-ink"
              }
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={
                isArticle
                  ? "mb-5 text-lg leading-[1.6] text-olive"
                  : "mb-4 leading-[1.6] text-olive"
              }
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={
                isArticle
                  ? "mb-5 list-disc space-y-2 pl-7 text-lg text-olive"
                  : "mb-4 list-disc space-y-2 pl-6 text-olive"
              }
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={
                isArticle
                  ? "mb-5 list-decimal space-y-2 pl-7 text-lg text-olive"
                  : "mb-4 list-decimal space-y-2 pl-6 text-olive"
              }
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={isArticle ? "leading-[1.6]" : "leading-[1.6]"}>{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={
                isArticle
                  ? "mb-5 border-l-4 border-terracotta/50 bg-parchment px-5 py-3 text-lg italic text-olive"
                  : "mb-4 border-l-4 border-border-warm bg-parchment px-4 py-3 italic text-olive"
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
                <code className="rounded-md bg-warm-sand px-1.5 py-0.5 font-mono text-sm text-terracotta">
                  {children}
                </code>
              );
            }

            return (
              <pre className="mb-5 overflow-x-auto rounded-2xl bg-dark-surface p-5 text-sm text-warm-silver">
                <code>{children}</code>
              </pre>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-coral underline decoration-coral/40 underline-offset-2 hover:text-terracotta"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="mb-5 overflow-x-auto rounded-xl border border-border-cream">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border-cream bg-warm-sand px-3 py-2 text-left font-medium text-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border-cream px-3 py-2 text-olive">{children}</td>
          ),
          br: () => <br />,
          hr: () => <hr className="my-8 border-border-cream" />,
          img: (props) => {
            const seq = imgSeqRef.current++;
            const bodyIdx = seq - previewBodyImageOffset;
            const { src, alt, width, height, style, className } = props;
            const imageStyle = mergeImageStyle(
              style as CSSProperties | undefined,
              width,
              height,
            );

            if (useResize && bodyIdx >= 0 && onPreviewBodyImageResize) {
              return (
                <EditorResizablePreviewImage
                  key={`${seq}-${String(src)}`}
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  style={imageStyle}
                  className={className as string | undefined}
                  bodyImageIndex={bodyIdx}
                  onCommitWidth={onPreviewBodyImageResize}
                />
              );
            }

            return (
              <img
                key={`${seq}-${String(src)}`}
                src={src}
                alt={alt ?? ""}
                width={width}
                height={height}
                style={imageStyle}
                className={cn(
                  "my-6 max-w-full rounded-2xl shadow-whisper",
                  imageStyle?.height == null && "h-auto",
                  className,
                )}
              />
            );
          },
        }}
      >
        {content || "Nothing to preview yet..."}
      </ReactMarkdown>
    </div>
  );
}
