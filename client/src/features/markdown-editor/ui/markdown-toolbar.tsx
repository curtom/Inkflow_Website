type Props = {
  onAction: (action: string) => void;
};

const items = [
  { key: "bold", label: "B" },
  { key: "italic", label: "I" },
  { key: "link", label: "Link" },
  { key: "image", label: "Image" },
  { key: "h2", label: "H2" },
  { key: "quote", label: "Quote" },
  { key: "code", label: "</>" },
  { key: "ul", label: "• List" },
  { key: "ol", label: "1. List" },
];

export default function MarkdownToolbar({ onAction }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onAction(item.key)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
