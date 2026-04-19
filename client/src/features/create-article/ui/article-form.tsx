import { useEffect, useMemo, useRef, useState } from "react";
import { Redo2, Undo2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/shared/ui/input";
import Button from "@/shared/ui/button";
import ImageUploadField from "@/features/upload-image/ui/image-upload-field";
import MarkdownToolbar from "@/features/markdown-editor/ui/markdown-toolbar";
import MarkdownPreview from "@/features/markdown-editor/ui/markdown-preview";
import { uploadImageRequest } from "@/entities/upload/api/upload-api";
import {
  articleSchema,
  type ArticleFormValues,
} from "@/shared/schemas/article-schema";

function cloneFormSnapshot(v: ArticleFormValues): ArticleFormValues {
  return {
    title: v.title,
    summary: v.summary,
    content: v.content,
    coverImage: v.coverImage ?? "",
    tags: v.tags ?? "",
  };
}

function formSnapshotsEqual(a: ArticleFormValues, b: ArticleFormValues) {
  return (
    a.title === b.title &&
    a.summary === b.summary &&
    a.content === b.content &&
    (a.coverImage ?? "") === (b.coverImage ?? "") &&
    (a.tags ?? "") === (b.tags ?? "")
  );
}
import {
  loadDraft,
  saveDraft,
  clearDraft,
  formatDraftTime,
  type DraftData,
} from "@/features/create-article/lib/draft";
import { suggestCommunityTagsRequest } from "@/features/community/api/community-api";

type ArticleFormProps = {
  defaultValues?: Partial<ArticleFormValues>;
  submitText: string;
  loading?: boolean;
  draftKey?: string;
  onSubmit: (values: ArticleFormValues) => Promise<void> | void;
};

type EditorTab = "edit" | "preview";

function normalizeTagText(value?: string) {
  return value ?? "";
}

function splitTagsInput(tags: string) {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function mergeTagSuggestionLine(current: string, newTags: string[]) {
  const set = new Set(splitTagsInput(current));
  for (const t of newTags) {
    set.add(t);
  }
  return Array.from(set).join(", ");
}

export default function ArticleForm({
  defaultValues,
  submitText,
  loading = false,
  draftKey,
  onSubmit,
}: ArticleFormProps) {
  const [tab, setTab] = useState<EditorTab>("edit");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Draft state
  const [draftBanner, setDraftBanner] = useState<DraftData | null>(null);
  const [draftStatus, setDraftStatus] = useState<string>("");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image insertion state
  const [imageInputOpen, setImageInputOpen] = useState(false);
  const [imageAlt, setImageAlt] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestHint, setSuggestHint] = useState("");
  const imageCursorRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const imageFileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      summary: defaultValues?.summary ?? "",
      content: defaultValues?.content ?? "",
      coverImage: defaultValues?.coverImage ?? "",
      tags: normalizeTagText(defaultValues?.tags),
    },
  });

  const historyWatchSerialized = JSON.stringify(useWatch({ control }) ?? {});

  const isApplyingHistoryRef = useRef(false);
  const lastSnapshotRef = useRef<ArticleFormValues | null>(null);
  const pastRef = useRef<ArticleFormValues[]>([]);
  const futureRef = useRef<ArticleFormValues[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    isApplyingHistoryRef.current = true;
    reset({
      title: defaultValues?.title ?? "",
      summary: defaultValues?.summary ?? "",
      content: defaultValues?.content ?? "",
      coverImage: defaultValues?.coverImage ?? "",
      tags: normalizeTagText(defaultValues?.tags),
    });
    pastRef.current = [];
    futureRef.current = [];
    queueMicrotask(() => {
      lastSnapshotRef.current = cloneFormSnapshot(getValues());
      isApplyingHistoryRef.current = false;
      setHistoryVersion((x) => x + 1);
    });
  }, [defaultValues, reset]);

  useEffect(() => {
    if (isApplyingHistoryRef.current) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (isApplyingHistoryRef.current) {
        return;
      }
      const snap = cloneFormSnapshot(getValues());
      if (lastSnapshotRef.current === null) {
        lastSnapshotRef.current = snap;
        return;
      }
      if (formSnapshotsEqual(lastSnapshotRef.current, snap)) {
        return;
      }
      pastRef.current = [...pastRef.current, lastSnapshotRef.current];
      futureRef.current = [];
      lastSnapshotRef.current = snap;
      setHistoryVersion((x) => x + 1);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [historyWatchSerialized]);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const undoEditStep = () => {
    if (pastRef.current.length === 0) {
      return;
    }
    isApplyingHistoryRef.current = true;
    const prev = pastRef.current[pastRef.current.length - 1]!;
    pastRef.current = pastRef.current.slice(0, -1);
    const current = lastSnapshotRef.current!;
    futureRef.current = [current, ...futureRef.current];
    lastSnapshotRef.current = cloneFormSnapshot(prev);
    reset(prev);
    queueMicrotask(() => {
      isApplyingHistoryRef.current = false;
      setHistoryVersion((x) => x + 1);
    });
  };

  const redoEditStep = () => {
    if (futureRef.current.length === 0) {
      return;
    }
    isApplyingHistoryRef.current = true;
    const next = futureRef.current[0]!;
    futureRef.current = futureRef.current.slice(1);
    const current = lastSnapshotRef.current!;
    pastRef.current = [...pastRef.current, current];
    lastSnapshotRef.current = cloneFormSnapshot(next);
    reset(next);
    queueMicrotask(() => {
      isApplyingHistoryRef.current = false;
      setHistoryVersion((x) => x + 1);
    });
  };

  // Check for saved draft on mount
  useEffect(() => {
    if (!draftKey) return;
    const draft = loadDraft(draftKey);
    if (!draft) return;

    const dv = defaultValues ?? {};
    const draftVals = draft.values;
    const hasContent =
      draftVals.title || draftVals.summary || draftVals.content;
    const isDifferent =
      draftVals.title !== (dv.title ?? "") ||
      draftVals.summary !== (dv.summary ?? "") ||
      draftVals.content !== (dv.content ?? "");

    if (hasContent && isDifferent) {
      setDraftBanner(draft);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  const { ref: contentRef, ...contentRegister } = register("content");

  const title = watch("title");
  const summary = watch("summary");
  const content = watch("content");
  const coverImage = watch("coverImage");
  const tags = watch("tags");

  const handleSuggestCommunityTags = async () => {
    const t = getValues("title") ?? "";
    const s = getValues("summary") ?? "";
    const c = getValues("content") ?? "";
    const tagLine = getValues("tags") ?? "";
    if (!t.trim() || !s.trim() || !c.trim()) {
      setSuggestHint("Add title, summary, and content first.");
      return;
    }
    setSuggestLoading(true);
    setSuggestHint("");
    try {
      const result = await suggestCommunityTagsRequest({
        title: t,
        summary: s,
        content: c,
        tags: splitTagsInput(tagLine),
      });
      if (result.disabledReason === "missing_api_key") {
        setSuggestHint(
          "Server has no DASHSCOPE_API_KEY or OPENAI_API_KEY; add one in server .env."
        );
        return;
      }
      if (result.matchedTags.length === 0) {
        setSuggestHint(
          `No community group met the similarity threshold (${result.threshold}).`
        );
        return;
      }
      setValue("tags", mergeTagSuggestionLine(tagLine, result.matchedTags));
      setSuggestHint(`Added tags: ${result.matchedTags.join(", ")}`);
    } catch {
      setSuggestHint("Could not load suggestions. Try again.");
    } finally {
      setSuggestLoading(false);
    }
  };

  // Debounced auto-save
  useEffect(() => {
    if (!draftKey) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const vals = { title, summary, content, coverImage, tags };
      saveDraft(draftKey, vals);
      setDraftStatus(`Draft saved at ${formatDraftTime(new Date().toISOString())}`);
    }, 1500);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, summary, content, coverImage, tags, draftKey]);

  const handleRestoreDraft = () => {
    if (!draftBanner) return;
    const v = draftBanner.values;
    isApplyingHistoryRef.current = true;
    reset({
      title: v.title ?? "",
      summary: v.summary ?? "",
      content: v.content ?? "",
      coverImage: v.coverImage ?? "",
      tags: normalizeTagText(v.tags),
    });
    setDraftBanner(null);
    queueMicrotask(() => {
      pastRef.current = [];
      futureRef.current = [];
      lastSnapshotRef.current = cloneFormSnapshot(getValues());
      isApplyingHistoryRef.current = false;
      setHistoryVersion((x) => x + 1);
    });
  };

  const handleDiscardDraft = () => {
    if (draftKey) clearDraft(draftKey);
    setDraftBanner(null);
  };

  const previewMarkdown = useMemo(() => {
    const tagLine = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .map((tag) => `#${tag}`)
          .join(" ")
      : "";

    return [
      title ? `# ${title}` : "# New post title here...",
      summary ? `> ${summary}` : "",
      tagLine,
      content || "Write your post content here...",
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [title, summary, tags, content]);

  const applyMarkdown = (action: string) => {
    const textarea = textareaRef.current;

    if (action === "image") {
      const start = textarea?.selectionStart ?? 0;
      const end = textarea?.selectionEnd ?? 0;
      const selected = textarea ? textarea.value.slice(start, end) : "";
      imageCursorRef.current = { start, end };
      setImageAlt(selected || "");
      setImageInputOpen(true);
      return;
    }

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.slice(start, end);
    const before = current.slice(0, start);
    const after = current.slice(end);

    const insert = (nextText: string, cursorOffset?: number) => {
      const value = before + nextText + after;
      setValue("content", value, { shouldValidate: true, shouldDirty: true });

      requestAnimationFrame(() => {
        textarea.focus();
        const pos =
          cursorOffset !== undefined ? start + cursorOffset : start + nextText.length;
        textarea.setSelectionRange(pos, pos);
      });
    };

    switch (action) {
      case "bold": {
        const text = `**${selected || "bold text"}**`;
        insert(text, selected ? text.length : 2);
        break;
      }
      case "italic": {
        const text = `*${selected || "italic text"}*`;
        insert(text, selected ? text.length : 1);
        break;
      }
      case "link": {
        const label = selected || "link text";
        const text = `[${label}](https://example.com)`;
        insert(text);
        break;
      }
      case "h2": {
        const text = `## ${selected || "Heading"}`;
        insert(text);
        break;
      }
      case "quote": {
        const text = `> ${selected || "Quote"}`;
        insert(text);
        break;
      }
      case "code": {
        const text = selected
          ? `\`\`\`\n${selected}\n\`\`\``
          : "```js\nconst example = true;\n```";
        insert(text);
        break;
      }
      case "ul": {
        const text = selected
          ? selected
              .split("\n")
              .map((line) => `- ${line}`)
              .join("\n")
          : "- List item";
        insert(text);
        break;
      }
      case "ol": {
        const text = selected
          ? selected
              .split("\n")
              .map((line, index) => `${index + 1}. ${line}`)
              .join("\n")
          : "1. List item";
        insert(text);
        break;
      }
      default:
        break;
    }
  };

  const insertImageMarkdown = (url: string, alt: string) => {
    const textarea = textareaRef.current;
    const { start, end } = imageCursorRef.current;
    const current = getValues("content");
    const before = current.slice(0, start);
    const after = current.slice(end);
    const mdImage = `![${alt || "image"}](${url})`;
    setValue("content", before + mdImage + after, { shouldValidate: true, shouldDirty: true });

    requestAnimationFrame(() => {
      if (textarea) {
        textarea.focus();
        const pos = start + mdImage.length;
        textarea.setSelectionRange(pos, pos);
      }
    });

    setImageInputOpen(false);
    setImageAlt("");
  };

  const handleUploadImageFile = async (file: File | null) => {
    if (!file) return;
    try {
      setImageUploading(true);
      const response = await uploadImageRequest(file);
      insertImageMarkdown(response.data.url, imageAlt.trim() || file.name.replace(/\.[^.]+$/, ""));
    } catch {
      window.alert("Image upload failed. Please try again.");
    } finally {
      setImageUploading(false);
      if (imageFileRef.current) imageFileRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="space-y-6"
    >
      {/* Draft restore banner */}
      {draftBanner ? (
        <div className="flex items-center justify-between rounded-2xl border border-terracotta/35 bg-parchment px-5 py-3 text-sm text-charcoal">
          <span>
            You have an unsaved draft from{" "}
            <strong>{formatDraftTime(draftBanner.savedAt)}</strong>. Restore it?
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="rounded-lg bg-terracotta px-3 py-1 text-xs font-medium text-ivory shadow-[0_0_0_1px_#c96442] hover:brightness-[0.95]"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded-lg border border-border-warm bg-ivory px-3 py-1 text-xs font-medium text-charcoal hover:bg-warm-sand/80"
            >
              Discard
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-border-cream bg-ivory shadow-whisper">
        <div className="flex flex-col gap-4 border-b border-border-cream px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <ImageUploadField
              label="Add a cover image"
              layout="horizontal"
              value={coverImage ?? ""}
              onUploaded={(url) =>
                setValue("coverImage", url, { shouldValidate: true })
              }
            />

            <div className="hidden">
              <Input
                label="Cover Image URL"
                placeholder="https://example.com/cover.jpg"
                error={errors.coverImage?.message}
                {...register("coverImage")}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTab("edit")}
              className={`text-base font-medium cursor-pointer ${
                tab === "edit" ? "text-ink" : "text-stone"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`text-base font-medium cursor-pointer ${
                tab === "preview" ? "text-ink" : "text-stone"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="px-6 pt-8">
          <input
            type="text"
            placeholder="New post title here..."
            className="w-full border-none bg-transparent font-editorial text-6xl font-medium leading-tight text-charcoal outline-none placeholder:text-warm-silver"
            {...register("title")}
          />
          {errors.title?.message ? (
            <p className="mt-2 text-sm text-error">{errors.title.message}</p>
          ) : null}

          <div className="mt-4">
            <input
              type="text"
              placeholder="Write a short summary..."
              className="w-full border-none bg-transparent text-2xl leading-relaxed text-charcoal outline-none placeholder:text-warm-silver"
              {...register("summary")}
            />
            {errors.summary?.message ? (
              <p className="mt-2 text-sm text-error">{errors.summary.message}</p>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-end gap-3">
              <input
                type="text"
                placeholder="Add tags, separated by commas..."
                className="min-w-0 flex-1 border-none bg-transparent text-lg text-stone outline-none placeholder:text-warm-silver"
                {...register("tags")}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 !bg-ivory hover:!bg-parchment"
                disabled={loading || suggestLoading}
                onClick={() => void handleSuggestCommunityTags()}
              >
                {suggestLoading ? "Suggesting…" : "Suggest community tags"}
              </Button>
            </div>
            {suggestHint ? (
              <p className="mt-2 text-sm text-charcoal">{suggestHint}</p>
            ) : null}
            {errors.tags?.message ? (
              <p className="mt-2 text-sm text-error">{errors.tags.message}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          <MarkdownToolbar onAction={applyMarkdown} />

          {/* Image insert panel */}
          {imageInputOpen ? (
            <div className="border-b border-border-cream bg-parchment px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-stone">Insert image</span>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  disabled={imageUploading}
                  onChange={(e) => handleUploadImageFile(e.target.files?.[0] ?? null)}
                  className="min-w-[200px] flex-1 rounded-lg border border-border-cream bg-ivory px-3 py-1.5 text-sm text-charcoal file:mr-3 file:rounded file:border-0 file:bg-warm-sand file:px-2 file:py-1 file:text-xs file:font-medium file:text-charcoal disabled:opacity-60"
                />
                <input
                  type="text"
                  placeholder="Alt text (optional)"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  disabled={imageUploading}
                  className="w-44 rounded-lg border border-border-warm bg-ivory px-3 py-1.5 text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/25 disabled:opacity-60"
                />
                {imageUploading ? (
                  <span className="text-xs text-warm-silver">Uploading...</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setImageInputOpen(false)}
                  className="rounded-md px-2 py-1 text-xs text-warm-silver hover:bg-warm-sand/80"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : null}

          {tab === "edit" ? (
            <div className="min-h-[420px] rounded-b-3xl bg-ivory px-6 py-6">
              <textarea
                rows={18}
                placeholder="Write your post content here..."
                className="h-[420px] w-full resize-none border-none bg-transparent font-mono text-3xl leading-10 text-charcoal outline-none placeholder:text-warm-silver"
                ref={(el) => {
                  contentRef(el);
                  textareaRef.current = el;
                }}
                {...contentRegister}
              />
              {errors.content?.message ? (
                <p className="mt-2 text-sm text-error">{errors.content.message}</p>
              ) : null}
            </div>
          ) : (
            <MarkdownPreview content={previewMarkdown} />
          )}
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-4"
        data-edit-history={historyVersion}
      >
        <Button type="submit" loading={loading || isSubmitting}>
          {submitText}
        </Button>

        <button
          type="button"
          onClick={undoEditStep}
          disabled={!canUndo}
          title="上一步"
          aria-label="上一步"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-charcoal transition hover:bg-warm-sand/80 hover:text-ink disabled:cursor-not-allowed disabled:text-warm-silver disabled:hover:bg-transparent"
        >
          <Undo2 className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={redoEditStep}
          disabled={!canRedo}
          title="下一步"
          aria-label="下一步"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-charcoal transition hover:bg-warm-sand/80 hover:text-ink disabled:cursor-not-allowed disabled:text-warm-silver disabled:hover:bg-transparent"
        >
          <Redo2 className="h-5 w-5" aria-hidden />
        </button>

        {draftStatus ? (
          <span className="ml-auto text-sm text-warm-silver">{draftStatus}</span>
        ) : null}
      </div>
    </form>
  );
}
