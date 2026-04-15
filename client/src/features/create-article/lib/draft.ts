export type DraftData = {
  savedAt: string;
  values: {
    title?: string;
    summary?: string;
    content?: string;
    coverImage?: string;
    tags?: string;
  };
};

export function loadDraft(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

export function saveDraft(key: string, values: DraftData["values"]) {
  const data: DraftData = { savedAt: new Date().toISOString(), values };
  localStorage.setItem(key, JSON.stringify(data));
}

export function clearDraft(key: string) {
  localStorage.removeItem(key);
}

export function formatDraftTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
