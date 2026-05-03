export type ContentImageToken = {
  start: number;
  end: number;
  src: string;
  alt: string;
  raw: string;
  format: "md" | "html";
  width?: string;
  height?: string;
  style?: string;
};

export function escapeHtmlAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeBasicEntities(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function readHtmlAttr(raw: string, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = raw.match(
    new RegExp(`\\b${escapedName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return (match?.[2] ?? match?.[3] ?? match?.[4] ?? "").trim();
}

function parseHtmlImg(raw: string): {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  style?: string;
} {
  const srcRaw = readHtmlAttr(raw, "src");
  const altRaw = readHtmlAttr(raw, "alt");
  const widthRaw = readHtmlAttr(raw, "width");
  const heightRaw = readHtmlAttr(raw, "height");
  const styleRaw = readHtmlAttr(raw, "style");

  return {
    src: decodeBasicEntities(srcRaw),
    alt: decodeBasicEntities(altRaw),
    width: widthRaw ? decodeBasicEntities(widthRaw) : undefined,
    height: heightRaw ? decodeBasicEntities(heightRaw) : undefined,
    style: styleRaw ? decodeBasicEntities(styleRaw) : undefined,
  };
}

function upsertHtmlAttr(raw: string, name: string, value: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const attrPattern = new RegExp(
    `\\b${escapedName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const attr = `${name}="${escapeHtmlAttr(value)}"`;
  if (attrPattern.test(raw)) {
    return raw.replace(attrPattern, attr);
  }
  return raw.replace(/\s*\/?>$/, (tail) => ` ${attr}${tail}`);
}

function removeHtmlAttr(raw: string, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const attrPattern = new RegExp(
    `\\s+${escapedName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  return raw.replace(attrPattern, "");
}

/**
 * List markdown / HTML images in document order (for body sync only: use on `content` field).
 */
export function listImageTokens(source: string): ContentImageToken[] {
  const tokens: ContentImageToken[] = [];
  let i = 0;
  while (i < source.length) {
    const md = source.indexOf("![", i);
    const hi = source.toLowerCase().indexOf("<img", i);
    let pick = -1;
    let kind: "md" | "html";
    if (md < 0 && hi < 0) break;
    if (md < 0) {
      pick = hi;
      kind = "html";
    } else if (hi < 0) {
      pick = md;
      kind = "md";
    } else if (md <= hi) {
      pick = md;
      kind = "md";
    } else {
      pick = hi;
      kind = "html";
    }

    if (kind === "md") {
      const slice = source.slice(pick);
      const m = slice.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (!m) {
        i = pick + 2;
        continue;
      }
      const raw = m[0];
      tokens.push({
        start: pick,
        end: pick + raw.length,
        src: m[2].trim(),
        alt: m[1],
        raw,
        format: "md",
      });
      i = pick + raw.length;
    } else {
      const slice = source.slice(pick);
      const m = slice.match(/^<img\b[^>]*>/i);
      if (!m) {
        i = pick + 4;
        continue;
      }
      const raw = m[0];
      const { src, alt, width, height, style } = parseHtmlImg(raw);
      if (!src) {
        i = pick + raw.length;
        continue;
      }
      tokens.push({
        start: pick,
        end: pick + raw.length,
        src,
        alt,
        raw,
        format: "html",
        width,
        height,
        style,
      });
      i = pick + raw.length;
    }
  }
  return tokens;
}

export function buildSizedImgHtml(src: string, alt: string, widthPx: number): string {
  const w = Math.round(Math.max(16, Math.min(4096, widthPx)));
  const a = alt.trim() || "image";
  return `<img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(a)}" width="${w}" />`;
}

export function replaceImageAtIndexWithWidth(
  source: string,
  index: number,
  widthPx: number,
): string {
  const tokens = listImageTokens(source);
  const t = tokens[index];
  if (!t) return source;
  const w = Math.round(Math.max(16, Math.min(4096, widthPx)));
  const snippet =
    t.format === "html"
      ? upsertHtmlAttr(removeHtmlAttr(t.raw, "style"), "width", String(w))
      : buildSizedImgHtml(t.src, t.alt, w);
  return source.slice(0, t.start) + snippet + source.slice(t.end);
}

/** Insert image from toolbar: optional width px or %. Empty → markdown image. */
export function buildContentImageSnippet(url: string, alt: string, widthInput: string) {
  const label = alt.trim() || "image";
  const raw = widthInput.trim();
  const srcEsc = escapeHtmlAttr(url);
  const altEsc = escapeHtmlAttr(label);

  if (!raw) {
    return `<img src="${srcEsc}" alt="${altEsc}" />`;
  }

  const pctRaw = raw.replace(/\s/g, "");
  const pct = pctRaw.match(/^(\d{1,3})%$/);
  if (pct) {
    const n = Number(pct[1]);
    if (n >= 1 && n <= 100) {
      return `<img src="${srcEsc}" alt="${altEsc}" style="width: ${n}%; max-width: 100%; height: auto" />`;
    }
  }

  const pxNorm = raw.replace(/\s/g, "").toLowerCase();
  const px = pxNorm.match(/^(\d{1,4})(?:px)?$/);
  if (px) {
    const n = Number(px[1]);
    if (n >= 1 && n <= 4096) {
      return `<img src="${srcEsc}" alt="${altEsc}" width="${n}" />`;
    }
  }

  return `<img src="${srcEsc}" alt="${altEsc}" />`;
}
