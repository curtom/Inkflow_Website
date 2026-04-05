export function generateSlug(title: string) {
    return title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}