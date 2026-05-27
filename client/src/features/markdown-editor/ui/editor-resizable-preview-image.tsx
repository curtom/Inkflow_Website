import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { cn } from "@/shared/lib/cn";

type Props = {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  className?: string;
  /** Index in the **body** `content` field's image list */
  bodyImageIndex: number;
  onCommitWidth: (bodyImageIndex: number, widthPx: number) => void;
};

function parseWidthProp(w: string | number | undefined): number | null {
  if (w == null) return null;
  if (typeof w === "number" && Number.isFinite(w)) return Math.round(w);
  if (typeof w === "string" && /^\d+$/.test(w.trim())) return Number(w.trim());
  return null;
}

function parseInitialWidthCss(
  width: string | number | undefined,
  style: CSSProperties | undefined,
): string | null {
  const attrWidth = parseWidthProp(width);
  if (attrWidth != null) return `${attrWidth}px`;

  const styleWidth = style?.width;
  if (typeof styleWidth === "number" && Number.isFinite(styleWidth)) {
    return `${Math.round(styleWidth)}px`;
  }
  if (typeof styleWidth === "string") {
    const trimmed = styleWidth.trim();
    if (/^\d{1,4}px$/.test(trimmed) || /^\d{1,3}%$/.test(trimmed)) {
      return trimmed;
    }
  }

  return null;
}

export default function EditorResizablePreviewImage({
  src = "",
  alt = "",
  width,
  height,
  style,
  className,
  bodyImageIndex,
  onCommitWidth,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fromProps = parseInitialWidthCss(width, style);
  const imageHeight = parseWidthProp(height);
  const [displayWidth, setDisplayWidth] = useState<string | null>(() => fromProps);
  const [prevInitialWidth, setPrevInitialWidth] = useState(fromProps);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{
    startX: number;
    startW: number;
    maxW: number;
    currentW: number;
  } | null>(null);

  if (fromProps !== prevInitialWidth) {
    setPrevInitialWidth(fromProps);
    setDisplayWidth(fromProps);
  }

  const onImgLoad = useCallback(
    (img: HTMLImageElement) => {
      if (fromProps != null) return;
      if (displayWidth != null) return;
      const maxW = wrapRef.current?.parentElement?.clientWidth ?? 960;
      const rendered = Math.round(img.getBoundingClientRect().width);
      const natural = img.naturalWidth;
      const w =
        rendered > 0
          ? Math.min(rendered, maxW)
          : natural > 0
            ? Math.min(natural, maxW)
        : 0;
      if (w > 0) {
        setDisplayWidth(`${w}px`);
      }
    },
    [fromProps, displayWidth],
  );

  const startDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const maxW = Math.min(4096, wrap.parentElement?.clientWidth ?? 1200);
    const startW = wrap.offsetWidth;
    dragState.current = {
      startX: e.clientX,
      startW,
      maxW,
      currentW: startW,
    };
    setDragging(true);

    const onMove = (event: globalThis.MouseEvent) => {
      const d = dragState.current;
      const currentWrap = wrapRef.current;
      if (!d || !currentWrap) return;
      const next = Math.round(d.startW + event.clientX - d.startX);
      const clamped = Math.max(48, Math.min(next, d.maxW));
      d.currentW = clamped;
      currentWrap.style.width = `${clamped}px`;
    };

    const onUp = () => {
      const d = dragState.current;
      const currentWrap = wrapRef.current;
      if (d && currentWrap) {
        const w = Math.round(d.currentW || currentWrap.getBoundingClientRect().width);
        currentWrap.style.width = `${w}px`;
        setDisplayWidth(`${w}px`);
        onCommitWidth(bodyImageIndex, w);
      }
      dragState.current = null;
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={wrapRef}
      className="relative my-6 inline-block max-w-full align-middle"
      style={displayWidth != null ? { width: displayWidth, maxWidth: "100%" } : { maxWidth: "100%" }}
    >
      <img
        src={src}
        alt={alt ?? ""}
        width={undefined}
        height={imageHeight ?? undefined}
        loading="lazy"
        decoding="async"
        onLoad={(e) => {
          void onImgLoad(e.currentTarget);
        }}
        className={cn("block h-auto max-w-full rounded-2xl shadow-whisper", className)}
        style={{
          ...style,
          width: "100%",
          height: imageHeight != null ? `${imageHeight}px` : "auto",
        }}
      />
      <div
        role="presentation"
        title="拖拽调整大小"
        className={cn(
          "absolute bottom-0.5 right-0.5 z-10 h-4 w-4 cursor-se-resize rounded-sm border border-terracotta/70 bg-ivory shadow",
          "opacity-80 hover:opacity-100",
          dragging && "border-terracotta bg-parchment"
        )}
        onMouseDown={startDrag}
      />
    </div>
  );
}
