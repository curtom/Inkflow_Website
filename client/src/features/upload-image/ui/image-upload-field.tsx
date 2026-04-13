import { useState } from "react";
import { uploadImageRequest } from "@/entities/upload/api/upload-api";
import Button from "@/shared/ui/button";

type Props = {
    label: string;
    value?: string;
    onUploaded: (url: string) => void;
};

export default function ImageUploadField({
  label,
  value = "",
  onUploaded,
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
    <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>

        {value ? (
            <img 
              src={value}
              alt="Upload preview"
              className="h-40 w-full rounded-xl object-cover"
            />
        ): null}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleChange(e.target.files?.[0] ?? null)}
          className="block w-full text-sm texy-gray-700"
        />
        {uploading ? <Button type="button" loading>Uploading...</Button> : null}
    </div>
   );
}