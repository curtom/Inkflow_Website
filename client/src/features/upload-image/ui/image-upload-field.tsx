import { useState } from "react";
import { uploadImageRequest } from "@/entities/upload/api/upload-api";

type Props = {
    label: string;
    value?: string;
    onUploaded: (url: string) => void;
    layout?: "vertical" | "horizontal";
};

export default function ImageUploadField({
  label,
  value = "",
  onUploaded,
  layout = "vertical",
}: Props) {
   const [uploading, setUploading] = useState(false);

   const handleChange = async (file: File | null) => {
     if(!file) return;

     try {
        setUploading(true);
        const response = await uploadImageRequest(file);
        onUploaded(response.data.url);
     } catch(error) {
        console.error("Failed to upload image:", error);
        window.alert("Image upload failed");
     } finally {
        setUploading(false);
     }
   };

   return (
    <div className={`flex ${layout === "horizontal" ? "items-center gap-4" : "flex-col gap-3"}`}>
        {layout === "vertical" && (
            <span className="text-sm font-medium text-charcoal">{label}</span>
        )}

        {value ? (
            <img 
              src={value}
              alt="Upload preview"
              className="h-14 w-24 rounded-lg border border-border-cream object-cover shadow-whisper"
            />
        ): null}

        <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border-warm bg-ivory px-4 py-2 text-sm font-medium text-charcoal shadow-[0_0_0_1px_#f0eee6] transition hover:bg-parchment focus-within:ring-2 focus-within:ring-focus/35 focus-within:ring-offset-2 focus-within:ring-offset-parchment">
              <span>{uploading ? "Uploading..." : value ? "Change" : label}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleChange(e.target.files?.[0] ?? null)}
                className="sr-only"
                disabled={uploading}
              />
            </label>
        </div>
    </div>
   );
}