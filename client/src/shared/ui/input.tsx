import type{ InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
}

export default function Input({
    label,
    error,
    className,
    ...props
}: InputProps) {
     return (
         <div className="flex flex-col gap-1.5">
             {label && (
                 <label className="text-sm font-medium text-gray-700">{label}</label>
             )}
             <input
                className={cn("w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm " +
                    "text-gray-900 outline-none transition placeholder:text-gray-400 " +
                    "focus:border-green-500 focus:ring-2 focus:ring-green-100", error && "border-red-500 " +
                    "focus:border-red-500 focus:ring-red-100", className)}
                {...props}
             />
             {error && <span className="text-sm text-red-500">{error}</span>}
         </div>
     )
}