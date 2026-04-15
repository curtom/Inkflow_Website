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
            <span className="text-sm font-medium text-gray-700">{label}</span>
        )}

        {value ? (
            <img 
              src={value}
              alt="Upload preview"
              className="h-14 w-24 rounded-lg border border-gray-200 object-cover shadow-sm"
            />
        ): null}

        <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
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